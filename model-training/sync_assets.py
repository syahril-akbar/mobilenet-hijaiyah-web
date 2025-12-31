import os
import shutil
import glob

# Konfigurasi Path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, 'dataset')
WEB_PUBLIC_DIR = os.path.join(BASE_DIR, '..', 'web-app', 'public', 'gestures')

def sync_gestures():
    # Pastikan folder tujuan ada
    if not os.path.exists(WEB_PUBLIC_DIR):
        os.makedirs(WEB_PUBLIC_DIR)
        print(f"Membuat direktori: {WEB_PUBLIC_DIR}")

    # Ambil semua folder kelas (0_alif, 1_ba, dst)
    classes = [d for d in os.listdir(DATASET_DIR) if os.path.isdir(os.path.join(DATASET_DIR, d))]
    
    print(f"Menemukan {len(classes)} kelas. Mulai menyalin contoh...")

    for cls_folder in classes:
        # Ambil nama bersih (misal '0_alif' -> 'alif')
        clean_name = cls_folder.split('_')[1].lower() if '_' in cls_folder else cls_folder.lower()
        
        # Cari gambar pertama di dalam folder tersebut
        cls_path = os.path.join(DATASET_DIR, cls_folder)
        images = []
        for ext in ('*.jpg', '*.jpeg', '*.png', '*.JPG', '*.PNG'):
            images.extend(glob.glob(os.path.join(cls_path, ext)))
        
        if images:
            source_img = images[0] # Ambil gambar pertama
            file_ext = os.path.splitext(source_img)[1]
            dest_img = os.path.join(WEB_PUBLIC_DIR, f"{clean_name}{file_ext}")
            
            # Salin file
            shutil.copy2(source_img, dest_img)
            print(f"  [OK] {cls_folder} -> {clean_name}{file_ext}")
        else:
            print(f"  [!] {cls_folder} tidak memiliki gambar.")

    print("\nSinkronisasi selesai! Semua contoh sudah ada di web-app/public/gestures/")

if __name__ == "__main__":
    sync_gestures()
