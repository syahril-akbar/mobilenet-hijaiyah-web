# Deteksi Bahasa Isyarat Hijaiyah Berbasis Web (MobileNetV2)

Proyek ini adalah aplikasi web real-time untuk mendeteksi isyarat tangan huruf Hijaiyah menggunakan kamera. Aplikasi ini telah dilengkapi dengan teknologi **Auto Hand Tracking** untuk pengalaman pengguna yang lebih responsif dan modern.

## ✨ Fitur Utama

- **Auto Hand Tracking**: Menggunakan **MediaPipe Tasks Vision** untuk mendeteksi dan melacak posisi tangan secara otomatis (tidak perlu menyesuaikan tangan ke bingkai statis).
- **Dynamic ROI**: Area pemotongan (*crop*) gambar mengikuti pergerakan tangan pengguna secara real-time.
- **Klasifikasi MobileNetV2**: Model AI yang ringan dan dioptimalkan untuk perangkat web.
- **UI Modern**: Dibangun dengan **Next.js**, **Tailwind CSS**, dan **Shadcn UI** dengan tema Emerald yang segar.
- **Privasi Penuh**: Seluruh pemrosesan dilakukan di sisi klien (browser), tidak ada data video yang dikirim ke server.

---

## 📂 Struktur Folder

- **`web-app/`**: Frontend (Next.js + TypeScript).
- **`model-training/`**: Backend (Python) untuk melatih dan mengonversi model.

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
    Buka [http://localhost:3000](http://localhost:3000) dan izinkan akses kamera.

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
    *Skrip akan otomatis menghasilkan model TensorFlow.js di folder `output_model/tfjs_model`.*

4.  **Update ke Web**:
    Salin file hasil konversi ke `web-app/public/model/`.

---

## 🛠️ Catatan Teknis

- **Ambang Batas (Threshold)**: Sistem disetel pada **0.7 (70%)** sesuai standar skripsi. Jika akurasi rendah, sistem akan menampilkan pesan "Confidence Rendah".
- **Hardware**: Disarankan menggunakan browser Chrome/Edge dengan akselerasi GPU aktif untuk performa tracking yang mulus.
- **Editor**: Proyek ini menyertakan pengaturan `.vscode/settings.json` agar VS Code otomatis menggunakan Virtual Environment Python yang tepat.

---