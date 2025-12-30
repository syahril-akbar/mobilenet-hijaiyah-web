import cv2
import os
import time
import sys

# Konfigurasi
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')
IMG_SIZE = 300  # Ukuran kotak pengambilan gambar (ROI)

class DataCollector:
    def __init__(self):
        # Daftar kelas standar untuk inisialisasi otomatis
        self.default_classes = [
            "0_alif", "1_ba", "2_ta", "3_tsa", "4_jim", "5_ha", "6_kho",
            "7_dal", "8_dzal", "9_ro", "10_zai", "11_sin", "12_syin",
            "13_sho", "14_dho", "15_tho", "16_zho", "17_ain", "18_ghain",
            "19_fa", "20_qof", "21_kaf", "22_lam", "23_mim", "24_nun",
            "25_wau", "26_Ha", "27_ya"
        ]
        
        # Buat folder jika belum ada
        if not os.path.exists(DATASET_DIR):
            print(f"Membuat folder dataset di: {DATASET_DIR}")
            os.makedirs(DATASET_DIR)
            
        for cls in self.default_classes:
            class_dir = os.path.join(DATASET_DIR, cls)
            if not os.path.exists(class_dir):
                print(f"Membuat folder kelas: {cls}")
                os.makedirs(class_dir)

        # Ambil semua folder dan urutkan berdasarkan angka prefix (numeric sort)
        folders = [d for d in os.listdir(DATASET_DIR) if os.path.isdir(os.path.join(DATASET_DIR, d))]
        self.classes = sorted(folders, key=lambda x: int(x.split('_')[0]) if x.split('_')[0].isdigit() else 999)
        
    def clear_screen(self):
        os.system('cls' if os.name == 'nt' else 'clear')

    def print_header(self):
        self.clear_screen()
        print("="*60)
        print("   DATA COLLECTOR PRO - HIJAIYAH DATASET GENERATOR")
        print("="*60)

    def select_class(self):
        while True:
            self.print_header()
            print("Pilih folder target penyimpanan:\n")
            
            # Tampilkan grid kelas
            for i, cls in enumerate(self.classes):
                count = len(os.listdir(os.path.join(DATASET_DIR, cls)))
                print(f"[{i+1:>2}] {cls:<15} ({count} gambar)")
            
            print("\n[Q] Keluar")
            
            choice = input("\nMasukan nomor kelas (contoh: 1): ").strip()
            
            if choice.lower() == 'q':
                return None
            
            if choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < len(self.classes):
                    return self.classes[idx]
            
            print("Pilihan tidak valid!")
            time.sleep(1)

    def collect(self, class_name):
        save_dir = os.path.join(DATASET_DIR, class_name)
        cap = cv2.VideoCapture(0)
        
        # Cek kamera
        if not cap.isOpened():
            print("Error: Kamera tidak terdeteksi!")
            time.sleep(2)
            return

        print(f"\n[INFO] Memulai kamera untuk kelas: {class_name}")
        print("-------------------------------------------------")
        print("INSTRUKSI:")
        print("1. Masukkan tangan ke dalam KOTAK HIJAU.")
        print("2. Tekan & Tahan [S] untuk SAVE (Mode Beruntun).")
        print("3. Tekan [Q] untuk KEMBALI ke menu.")
        print("-------------------------------------------------")
        print("Tekan Enter untuk mulai...")
        input()

        count = len(os.listdir(save_dir))
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1) # Mirror effect
            h, w, _ = frame.shape
            
            # Koordinat Kotak ROI (Tengah Layar)
            top = int((h - IMG_SIZE) / 2)
            left = int((w - IMG_SIZE) / 2)
            bottom = top + IMG_SIZE
            right = left + IMG_SIZE

            # Extract ROI (Area Tangan)
            roi = frame[top:bottom, left:right]
            
            # Visualisasi GUI
            display = frame.copy()
            
            # Gambar kotak panduan
            cv2.rectangle(display, (left, top), (right, bottom), (0, 255, 0), 2)
            
            # Info Teks
            cv2.putText(display, f"Kelas: {class_name}", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(display, f"Total: {count}", (10, 60), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(display, "Tahan 'S' untuk Rekam", (10, h - 20), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 1)

            # Input Keyboard
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('s'): # Simpan Gambar
                timestamp = int(time.time() * 1000)
                filename = os.path.join(save_dir, f"{timestamp}.jpg")
                cv2.imwrite(filename, roi)
                count += 1
                
                # Visualisasi 'Rec' (Lingkaran Merah)
                cv2.circle(display, (w - 30, 30), 10, (0, 0, 255), -1)
                cv2.putText(display, "REC", (w - 70, 35), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

            elif key == ord('q'): # Quit
                break

            cv2.imshow("Data Collector Pro", display)

        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    app = DataCollector()
    while True:
        target_class = app.select_class()
        if not target_class:
            print("Sampai jumpa!")
            break
        app.collect(target_class)
