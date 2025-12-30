import os
import glob
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Input, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import shutil
import subprocess

# --- Konfigurasi ---
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')
OUTPUT_MODEL_DIR = os.path.join(os.path.dirname(__file__), 'output_model')
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 50  # Batas maksimal epoch sesuai skripsi
LEARNING_RATE = 0.001
SEED = 42

# Memastikan hasil dapat direproduksi
tf.random.set_seed(SEED)
np.random.seed(SEED)

# Membuat direktori output jika belum ada
os.makedirs(OUTPUT_MODEL_DIR, exist_ok=True)
os.makedirs(os.path.join(OUTPUT_MODEL_DIR, 'plots'), exist_ok=True)

def load_data_paths(dataset_dir):
    """
    Memuat path gambar dan label dari direktori dataset.
    Asumsi struktur: dataset_dir/nama_kelas/file_gambar
    """
    file_paths = []
    labels = []
    classes = sorted([d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d))])
    
    class_to_idx = {cls_name: idx for idx, cls_name in enumerate(classes)}
    idx_to_class = {idx: cls_name for cls_name, idx in class_to_idx.items()}
    
    print(f"[INFO] Menemukan {len(classes)} kelas: {classes}")

    for cls_name in classes:
        cls_dir = os.path.join(dataset_dir, cls_name)
        # Mendukung ekstensi gambar umum
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.bmp']:
            cls_files = glob.glob(os.path.join(cls_dir, ext))
            for file_path in cls_files:
                file_paths.append(file_path)
                labels.append(class_to_idx[cls_name])
                
    return np.array(file_paths), np.array(labels), classes, idx_to_class

def build_augmenter():
    """
    Membuat model augmentasi data menggunakan layer preprocessing Keras.
    Teknik: Rotasi, Flip, Zoom, Kecerahan.
    """
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomRotation(0.15), # sekitar 15 derajat
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomZoom(0.2), 
        tf.keras.layers.RandomBrightness(0.2),
        tf.keras.layers.RandomContrast(0.2),
    ], name="data_augmentation")
    return data_augmentation

def preprocess_image(file_path, label):
    """
    Memuat dan memproses satu gambar.
    """
    img = tf.io.read_file(file_path)
    img = tf.image.decode_jpeg(img, channels=3) 
    img = tf.image.resize(img, IMG_SIZE)
    
    # Preprocessing spesifik MobileNetV2 (konversi 0-255 ke rentang -1 hingga 1)
    img = preprocess_input(img) 
    
    return img, label

def create_dataset(file_paths, labels, is_training=False):
    """
    Membuat tf.data.Dataset dari path file dan label.
    """
    ds = tf.data.Dataset.from_tensor_slices((file_paths, labels))
    
    # Memuat dan memproses gambar secara paralel
    ds = ds.map(preprocess_image, num_parallel_calls=tf.data.AUTOTUNE)
    
    if is_training:
        ds = ds.shuffle(buffer_size=len(file_paths))
    
    ds = ds.batch(BATCH_SIZE)
    ds = ds.prefetch(buffer_size=tf.data.AUTOTUNE)
    return ds

def build_model(num_classes, augmentation_layer):
    """
    Membangun model MobileNetV2 dengan skema Transfer Learning.
    """
    # Model Dasar (Base Model)
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
    )
    
    base_model.trainable = False # Membekukan layer dasar diawal

    inputs = Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3))
    
    # Terapkan augmentasi (aktif hanya saat fase training)
    x = augmentation_layer(inputs)
    
    # Lewatkan ke model dasar
    x = base_model(x, training=False) # BatchNormalization tetap dalam mode inferensi
    
    # Bagian Atas (Head Model)
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.2)(x) # Regulasi untuk mencegah overfitting
    outputs = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs, outputs)
    return model, base_model

def plot_history(history, save_path):
    """Visualisasi riwayat akurasi dan loss training."""
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    loss = history.history['loss']
    val_loss = history.history['val_loss']
    epochs_range = range(len(acc))

    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label='Akurasi Training')
    plt.plot(epochs_range, val_acc, label='Akurasi Validasi')
    plt.legend(loc='lower right')
    plt.title('Akurasi Training dan Validasi')

    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label='Loss Training')
    plt.plot(epochs_range, val_loss, label='Loss Validasi')
    plt.legend(loc='upper right')
    plt.title('Loss Training dan Validasi')
    plt.savefig(save_path)
    plt.close()

def plot_confusion_matrix(y_true, y_pred, classes, save_path):
    """Visualisasi Confusion Matrix menggunakan Seaborn."""
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(15, 15))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=classes, yticklabels=classes)
    plt.ylabel('Aktual')
    plt.xlabel('Prediksi')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def main():
    print("--- 1. Pengumpulan & Pembagian Data ---")
    file_paths, labels, classes, idx_to_class = load_data_paths(DATASET_DIR)
    num_classes = len(classes)
    
    if len(file_paths) == 0:
        print("[ERROR] Tidak ada gambar ditemukan! Pastikan folder dataset terisi.")
        return

    # Split: Train (70%), Temp (30%)
    X_train, X_temp, y_train, y_temp = train_test_split(
        file_paths, labels, test_size=0.3, stratify=labels, random_state=SEED
    )
    
    # Split Temp: Val (15% total), Test (15% total)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=SEED
    )
    
    print(f"Sampel Train: {len(X_train)}")
    print(f"Sampel Val:   {len(X_val)}")
    print(f"Sampel Test:  {len(X_test)}")
    
    # Membuat Dataset TF
    train_ds = create_dataset(X_train, y_train, is_training=True)
    val_ds = create_dataset(X_val, y_val)
    test_ds = create_dataset(X_test, y_test)
    
    print("\n--- 2. Membangun Model (MobileNetV2 Transfer Learning) ---")
    augmenter = build_augmenter()
    model, base_model = build_model(num_classes, augmenter)
    
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    
    print("\n--- 3. Proses Training ---")
    # Callbacks (Pengontrol Training)
    early_stopping = EarlyStopping(monitor='val_accuracy', patience=10, restore_best_weights=True, verbose=1)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=5, min_lr=1e-6, verbose=1)
    checkpoint_path = os.path.join(OUTPUT_MODEL_DIR, 'best_model.keras')
    model_checkpoint = ModelCheckpoint(checkpoint_path, monitor='val_accuracy', save_best_only=True, verbose=1)
    
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[early_stopping, reduce_lr, model_checkpoint]
    )
    
    # Plot riwayat
    plot_history(history, os.path.join(OUTPUT_MODEL_DIR, 'plots', 'training_history.png'))
    
    print("\n--- 4. Evaluasi Model ---")
    loss, accuracy = model.evaluate(test_ds)
    print(f"Akurasi Test: {accuracy*100:.2f}%")
    
    # Laporan Detail
    y_pred_probs = model.predict(test_ds)
    y_pred = np.argmax(y_pred_probs, axis=1)
    
    print(classification_report(y_test, y_pred, target_names=classes))
    
    plot_confusion_matrix(y_test, y_pred, classes, os.path.join(OUTPUT_MODEL_DIR, 'plots', 'confusion_matrix.png'))
    
    print("\n--- 5. Penyimpanan & Konversi ---")
    # Simpan model penuh
    save_path_h5_full = os.path.join(OUTPUT_MODEL_DIR, 'mobilenet_hijaiyah_full.h5')
    model.save(save_path_h5_full)
    print(f"Model lengkap disimpan di: {save_path_h5_full}")

    # Buat Model Inferensi (Hapus layer augmentasi agar kompatibel dengan TF.js)
    print("Mengekstrak model inferensi (menghapus layer augmentasi)...")
    inference_inputs = Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3))
    
    # Identifikasi layer MobileNetV2
    base_layer = [l for l in model.layers if 'mobilenet' in l.name.lower()][0]
    print(f"Layer dasar terpilih: {base_layer.name}")
    
    x = base_layer(inference_inputs, training=False)
    
    # Tambahkan sisa layer (Pooling, Dropout, Dense)
    base_index = model.layers.index(base_layer)
    for layer in model.layers[base_index+1:]:
        print(f"Menambahkan layer: {layer.name}")
        x = layer(x)
        
    inference_model = Model(inputs=inference_inputs, outputs=x)
    inference_model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

    save_path_inference = os.path.join(OUTPUT_MODEL_DIR, 'mobilenet_hijaiyah.h5')
    inference_model.save(save_path_inference)
    print(f"Model inferensi disimpan di: {save_path_inference}")
    
    # Konversi ke TensorFlow.js
    tfjs_target_dir = os.path.join(OUTPUT_MODEL_DIR, 'tfjs_model')
    try:
        command = [
            "tensorflowjs_converter",
            "--input_format=keras",
            save_path_inference,
            tfjs_target_dir
        ]
        print(f"Menjalankan konversi: {' '.join(command)}")
        subprocess.run(command, check=True, shell=True)
        print(f"Model TFJS disimpan di: {tfjs_target_dir}")
    except Exception as e:
        print(f"[WARNING] Gagal konversi otomatis. Error: {e}")

if __name__ == '__main__':
    main()