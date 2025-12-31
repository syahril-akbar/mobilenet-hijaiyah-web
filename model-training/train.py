import os
import glob
import shutil
import subprocess
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.utils import class_weight
# Menggunakan import langsung dari keras untuk menghindari masalah kompatibilitas IDE
from keras.applications import MobileNetV2
from keras.layers import Dense, GlobalAveragePooling2D, Input, Dropout, RandomRotation, RandomFlip, RandomZoom, RandomBrightness, RandomContrast, RandomTranslation
from keras.models import Model
from keras.optimizers import Adam
from keras.callbacks import EarlyStopping, ModelCheckpoint, TensorBoard

# --- Utilitas UI Terminal Pro ---
class TerminalUI:
    BOLD = "\033[1m"
    RESET = "\033[0m"
    DIVIDER = "═" * 70

    @staticmethod
    def step(num, title):
        print(f"\n{TerminalUI.BOLD}[ STEP {num} : {title.upper()} ]{TerminalUI.RESET}")
        print(TerminalUI.DIVIDER)

    @staticmethod
    def sub_info(label, value):
        print(f"  ├─ {label:<25} : {value}")

    @staticmethod
    def status(msg, type="info"):
        labels = {"info": "[INFO]", "success": "[OK]", "ai": "[AI]", "error": "[ERROR]"}
        print(f"  ├─ {labels.get(type, '[LOG]'):<25} : {msg}")

    @staticmethod
    def success(msg):
        print(f"  └─ SUCCESS: {msg}")

# --- Konfigurasi ---
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')
OUTPUT_MODEL_DIR = os.path.join(os.path.dirname(__file__), 'output_model')
REPORTS_DIR = os.path.join(OUTPUT_MODEL_DIR, 'reports')
PLOTS_DIR = os.path.join(OUTPUT_MODEL_DIR, 'plots')
LOG_DIR = os.path.join(OUTPUT_MODEL_DIR, 'logs', datetime.now().strftime("%Y%m%d-%H%M%S"))
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
SEED = 42

os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)
tf.random.set_seed(SEED)
np.random.seed(SEED)

def main():
    os.system('cls' if os.name == 'nt' else 'clear')
    print(f"{TerminalUI.BOLD}PIPELINE PELATIHAN MODEL{TerminalUI.RESET}")
    
    # --- FLOWCHART STEP 1: START ---
    TerminalUI.step(1, "START (Inisialisasi Sistem)")
    TerminalUI.sub_info("Waktu Mulai", datetime.now().strftime("%H:%M:%S"))
    TerminalUI.sub_info("Versi TensorFlow", tf.__version__)
    TerminalUI.sub_info("GPU Tersedia", "Ya" if tf.config.list_physical_devices('GPU') else "Tidak (Menggunakan CPU)")

    # --- FLOWCHART STEP 2: PENGUMPULAN & PENYEIMBANGAN DATASET ---
    TerminalUI.step(2, "PENGUMPULAN DATASET (28 Huruf Hijaiyah)")
    classes = sorted([d for d in os.listdir(DATASET_DIR) if os.path.isdir(os.path.join(DATASET_DIR, d))])
    
    # Menyiapkan wadah untuk jalur file per kelas
    class_file_map = {}
    total_files_awal = 0
    
    # Membaca semua file gambar
    for cls in classes:
        cls_dir = os.path.join(DATASET_DIR, cls)
        cls_files = []
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.bmp']:
            cls_files.extend(glob.glob(os.path.join(cls_dir, ext)))
        class_file_map[cls] = cls_files
        total_files_awal += len(cls_files)

    TerminalUI.sub_info("Total Kelas", len(classes))
    TerminalUI.sub_info("Total Data Awal", total_files_awal)

    # --- PROSES OVERSAMPLING ---
    # Mencari jumlah sampel terbanyak dalam satu kelas
    max_samples = max(len(files) for files in class_file_map.values())
    TerminalUI.status(f"Target sampel per kelas: {max_samples}", "ai")
    TerminalUI.status("Menyeimbangkan dataset (Oversampling)...", "ai")

    balanced_file_paths = []
    balanced_labels = []

    for cls in classes:
        files = class_file_map[cls]
        n_files = len(files)
        
        # Jika data kurang dari target, lakukan duplikasi acak
        if n_files < max_samples and n_files > 0:
            # Ambil semua file asli
            selected_files = files
            # Hitung kekurangan
            n_shortage = max_samples - n_files
            # Ambil acak dari file yang ada untuk menutupi kekurangan
            duplicated_files = np.random.choice(files, size=n_shortage, replace=True)
            # Gabungkan
            final_files = np.concatenate([selected_files, duplicated_files])
        else:
            final_files = files[:max_samples] # Potong jika berlebih (opsional, saat ini ambil max)

        balanced_file_paths.extend(final_files)
        balanced_labels.extend([classes.index(cls)] * len(final_files))

    TerminalUI.sub_info("Total Data Akhir", len(balanced_file_paths))
    TerminalUI.success("Dataset berhasil diindeks dan diseimbangkan.")

    # --- FLOWCHART STEP 3: PREPROCESSING ---
    TerminalUI.step(3, "PREPROCESSING (Resize & Normalisasi)")
    TerminalUI.sub_info("Target Dimensi", f"{IMG_SIZE[0]}x{IMG_SIZE[1]} piksel")
    TerminalUI.sub_info("Metode Normalisasi", "Min-Max 0-1 (img / 255.0)")
    
    def process(path, label):
        img = tf.io.read_file(path)
        img = tf.image.decode_jpeg(img, channels=3)
        img = tf.image.resize(img, IMG_SIZE)
        return tf.cast(img, tf.float32) / 255.0, label

    # --- FLOWCHART STEP 4: AUGMENTASI DATA ---
    TerminalUI.step(4, "AUGMENTASI DATA (On-the-fly)")
    TerminalUI.sub_info("Parameter Rotasi", "±20 Derajat")
    TerminalUI.sub_info("Parameter Zoom", "0.7x - 1.3x")
    TerminalUI.sub_info("Fitur Tambahan", "Flip, Kecerahan, Kontras, Geser")
    
    # Augmentasi diperkuat karena kita menggunakan Oversampling (banyak data duplikat)
    augmenter = tf.keras.Sequential([
        RandomRotation(20/360),       # Rotasi hingga 20 derajat
        RandomFlip("horizontal"),     # Membalik gambar horizontal
        RandomZoom(0.3),              # Zoom in/out hingga 30%
        RandomBrightness(0.2),        # Variasi kecerahan
        RandomContrast(0.2),          # Variasi kontras
        RandomTranslation(0.1, 0.1),  # Geser posisi gambar
    ], name="data_augmentation")

    # --- FLOWCHART STEP 5: SPLIT DATASET ---
    TerminalUI.step(5, "SPLIT DATASET (Train/Val/Test)")
    # Menggunakan data yang sudah diseimbangkan (balanced)
    X_train, X_temp, y_train, y_temp = train_test_split(balanced_file_paths, balanced_labels, test_size=0.3, stratify=balanced_labels, random_state=SEED)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=SEED)
    
    TerminalUI.sub_info("Training Set (70%)", f"{len(X_train)} sampel")
    TerminalUI.sub_info("Validation Set (15%)", f"{len(X_val)} sampel")
    TerminalUI.sub_info("Test Set (15%)", f"{len(X_test)} sampel")

    # Membuat objek Dataset TensorFlow
    train_ds = tf.data.Dataset.from_tensor_slices((X_train, y_train)).map(process).shuffle(1000).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
    val_ds = tf.data.Dataset.from_tensor_slices((X_val, y_val)).map(process).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
    test_ds = tf.data.Dataset.from_tensor_slices((X_test, y_test)).map(process).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

    # --- FLOWCHART STEP 6: LOAD MOBILENETV2 (Transfer Learning) ---
    TerminalUI.step(6, "LOAD MOBILENETV2 (Pre-trained ImageNet)")
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False # Bekukan bobot awal
    
    inputs = Input(shape=(224, 224, 3))
    x = augmenter(inputs)
    x = base_model(x, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.4)(x) # Dropout ditingkatkan ke 40% untuk mencegah overfitting data duplikat
    outputs = Dense(len(classes), activation='softmax')(x)
    model = Model(inputs, outputs)
    
    TerminalUI.sub_info("Total Layer", len(model.layers))
    TerminalUI.sub_info("Parameter Dapat Dilatih", f"{model.count_params():,}")
    TerminalUI.success("Model arsitektur siap.")

    # --- FLOWCHART STEP 7: TRAINING MODEL (Fase 1: Warmup) ---
    TerminalUI.step(7, "TRAINING MODEL (Fase 1: Warmup)")
    model.compile(optimizer=Adam(1e-3), loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    
    # Menghitung bobot kelas (opsional karena sudah oversampling, tapi tetap baik untuk keamanan)
    weights = class_weight.compute_class_weight('balanced', classes=np.unique(balanced_labels), y=balanced_labels)
    class_weight_dict = dict(enumerate(weights))

    history = model.fit(train_ds, validation_data=val_ds, epochs=15, verbose=1, class_weight=class_weight_dict)

    # --- FLOWCHART STEP 8 & 9: DECISION & TUNING ---
    TerminalUI.step(8, "DECISION & TUNING (Fine-Tuning Tahap 2)")
    TerminalUI.sub_info("Unfreeze MobileNetV2", "Layer 100 s/d 154")
    base_model.trainable = True
    # Bekukan 100 layer pertama, latih sisanya
    for layer in base_model.layers[:100]: layer.trainable = False
    
    # Gunakan learning rate yang sangat kecil untuk fine-tuning
    model.compile(optimizer=Adam(1e-5), loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    TerminalUI.status("Melakukan Fine-tuning untuk akurasi maksimal...", "ai")
    model.fit(train_ds, validation_data=val_ds, epochs=25, verbose=1, class_weight=class_weight_dict)

    # --- FLOWCHART STEP 10: EVALUASI MODEL ---
    TerminalUI.step(10, "EVALUASI MODEL (Accuracy & Metrics)")
    loss, accuracy = model.evaluate(test_ds, verbose=0)
    
    TerminalUI.sub_info("Akurasi Akhir", f"{accuracy*100:.2f}%")
    
    # Generate Laporan Klasifikasi
    y_pred = np.argmax(model.predict(test_ds, verbose=0), axis=1)
    report = classification_report(y_test, y_pred, target_names=classes)
    print(f"\n{report}")
    
    # Simpan Laporan CSV
    report_dict = classification_report(y_test, y_pred, target_names=classes, output_dict=True)
    pd.DataFrame(report_dict).transpose().to_csv(os.path.join(REPORTS_DIR, 'performa_final.csv'))
    
    # Plot Confusion Matrix
    plt.figure(figsize=(14, 12))
    sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt='d', cmap='Blues', xticklabels=classes, yticklabels=classes)
    plt.title('Confusion Matrix')
    plt.savefig(os.path.join(PLOTS_DIR, 'confusion_matrix.png'))
    TerminalUI.success("Visualisasi dan Tabel CSV berhasil disimpan.")

    # --- FLOWCHART STEP 11: SIMPAN MODEL ---
    TerminalUI.step(11, "SIMPAN MODEL (.h5)")
    save_path = os.path.join(OUTPUT_MODEL_DIR, 'mobilenet_hijaiyah.h5')
    
    # Ekstraksi model bersih untuk inferensi (tanpa layer augmentasi)
    inf_inputs = Input(shape=(224, 224, 3))
    # Mengambil output dari base_model (layer indeks ke-2 dst)
    # Layer 0: Input, Layer 1: Augmentasi (dilewati), Layer 2: MobileNetV2
    x_inf = model.layers[2](inf_inputs, training=False)
    for i in range(3, len(model.layers)): x_inf = model.layers[i](x_inf)
    Model(inputs=inf_inputs, outputs=x_inf).save(save_path)
    
    TerminalUI.sub_info("Path File", save_path)
    TerminalUI.success("Model .h5 tersimpan di direktori output.")

    # --- FLOWCHART STEP 12: KONVERSI KE TENSORFLOW.JS ---
    TerminalUI.step(12, "KONVERSI KE TENSORFLOW.JS (model.json)")
    try:
        tfjs_dir = os.path.join(OUTPUT_MODEL_DIR, 'tfjs_model')
        if os.path.exists(tfjs_dir): shutil.rmtree(tfjs_dir)
        subprocess.run(["tensorflowjs_converter", "--input_format=keras", save_path, tfjs_dir], check=True, shell=True)
        TerminalUI.success("Konversi ke format web selesai.")
        
        # Sinkronisasi ke Web App
        print("\n" + "═" * 70)
        pilihan = input(f"{TerminalUI.BOLD}SINKRONISASI: Salin model ke Web App? (y/n): {TerminalUI.RESET}").lower()
        if pilihan == 'y':
            web_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'web-app', 'public', 'model')
            if os.path.exists(web_dir): shutil.rmtree(web_dir)
            shutil.copytree(tfjs_dir, web_dir)
            TerminalUI.status("Web App berhasil disinkronisasi.", "success")
    except Exception as e:
        print(f"[ERROR] Gagal konversi: {e}")

    # --- FLOWCHART STEP 13: END ---
    TerminalUI.step(13, "END (Selesai)")
    TerminalUI.sub_info("Status Akhir", "Selesai Tanpa Hambatan")
    TerminalUI.sub_info("Waktu Selesai", datetime.now().strftime("%H:%M:%S"))
    print(f"\n{TerminalUI.BOLD}>>> SELURUH TAHAPAN FLOWCHART TELAH TERLAKSANA <<<{TerminalUI.RESET}\n")

if __name__ == '__main__':
    main()
