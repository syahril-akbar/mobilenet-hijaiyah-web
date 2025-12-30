# Deteksi Bahasa Isyarat Hijaiyah Berbasis Web (MobileNetV2)

Proyek ini adalah aplikasi web real-time untuk mendeteksi isyarat tangan huruf Hijaiyah menggunakan kamera. Aplikasi ini telah dilengkapi dengan teknologi **Auto Hand Tracking** dan sistem pelaporan otomatis.

## ✨ Fitur Utama

- **Auto Hand Tracking**: Menggunakan **MediaPipe Tasks Vision** untuk mendeteksi dan melacak posisi tangan secara otomatis (tidak perlu menyesuaikan tangan ke bingkai statis).
- **Dynamic ROI**: Area pemotongan (*crop*) gambar mengikuti pergerakan tangan pengguna secara real-time.
- **Klasifikasi MobileNetV2**: Model AI yang ringan dan dioptimalkan untuk perangkat web.
- **Terminal UI Pro (Training)**: Antarmuka terminal yang futuristik untuk memantau setiap tahapan *flowchart* pelatihan model secara detail.
- **Thesis Report Generator**: Otomatis menghasilkan narasi laporan, tabel performa CSV, dan analisis kesalahan klasifikasi.
- **UI Modern**: Dibangun dengan **Next.js**, **Tailwind CSS**, dan **Shadcn UI** dengan tema Emerald yang segar.
- **Real-time Console Bridge**: Log sistem dari browser dikirim secara langsung ke terminal pengembang secara real-time.
- **Privasi Penuh**: Seluruh pemrosesan dilakukan di sisi klien (browser), tidak ada data video yang dikirim ke server.

---

## 📂 Struktur Folder

- **`web-app/`**: Frontend (Next.js + TypeScript).
- **`model-training/`**: Backend (Python) untuk melatih dan mengonversi model.
- **`model-training/output_model/reports/`**: Hasil analisis otomatis.
- **`model-training/output_model/plots/`**: Grafik distribusi data dan Confusion Matrix.

---

## 🚀 Cara Menjalankan Aplikasi Web

Pastikan Anda sudah menginstal **Node.js**.

1.  **Masuk ke folder web-app:**
    ```bash
    cd web-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Jalankan server:**
    ```bash
    npm run dev
    ```

4.  **Akses Browser:**
    Buka [http://localhost:3000](http://localhost:3000) dan izinkan akses kamera. Pantau log real-time di terminal Anda.

---

## 🧠 Cara Melatih Ulang Model

1.  **Siapkan Dataset**: Simpan gambar di `model-training/dataset/` (minimal 100 gambar per huruf disarankan).
2.  **Setup Python**:
    ```bash
    cd model-training
    python -m venv venv
    .\venv\Scripts\activate
    pip install -r requirements.txt
    ```
3.  **Jalankan Training**:
    ```bash
    python train.py
    ```
    *Sistem akan menampilkan 13 tahapan alur pelatihan.*

4.  **Otomatis Sinkronisasi**:
    Setelah konversi selesai, ketik **'y'** pada dialog konfirmasi di terminal untuk memperbarui model di aplikasi web secara otomatis.

---

## 🛠️ Catatan Teknis & Metodologi

- **Normalisasi**: Menggunakan Min-Max Scaling (0-1).
- **Augmentasi**: Rotasi 15°, Zoom 0.8-1.2x, dan translasi posisi.
- **Ambang Batas (Threshold)**: Sistem disetel pada **0.7 (70%)**. Jika di bawah nilai ini, sistem menampilkan "Confidence Rendah".
- **Hardware**: Disarankan menggunakan browser Chrome/Edge dengan akselerasi GPU aktif untuk performa tracking yang mulus.
- **Editor**: Proyek ini menyertakan pengaturan `.vscode/settings.json` agar VS Code otomatis menggunakan Virtual Environment Python yang tepat.

---