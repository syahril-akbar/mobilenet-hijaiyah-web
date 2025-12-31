# HijaiyahAI - Sistem Pembelajaran Bahasa Isyarat Cerdas

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TensorFlow.js](https://img.shields.io/badge/AI-TensorFlow.js-orange?style=for-the-badge&logo=tensorflow)
![MobileNetV2](https://img.shields.io/badge/Model-MobileNetV2-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Stable-emerald?style=for-the-badge)

Aplikasi web modern untuk belajar dan mengenali isyarat tangan huruf Hijaiyah secara real-time. Menggabungkan teknologi *Computer Vision* dengan pengalaman belajar yang interaktif dan menyenangkan.

---

## ✨ Fitur Unggulan

### 🧠 Inti Kecerdasan Buatan
- **Klasifikasi Real-time:** Deteksi instan 28 huruf Hijaiyah menggunakan model **MobileNetV2** yang ringan dan efisien.
- **Auto Hand Tracking:** Integrasi **MediaPipe** untuk melacak posisi tangan secara presisi, memungkinkan deteksi yang akurat dalam berbagai kondisi posisi.
- **On-Device Inference:** Seluruh proses AI berjalan langsung di browser pengguna menggunakan akselerasi GPU (WebGL), menjamin kecepatan tinggi dan privasi data.

### 🎮 Pengalaman Belajar Interaktif
- **Kamus Isyarat (Panduan):** Katalog visual lengkap sebagai referensi bentuk tangan untuk setiap huruf Hijaiyah.
- **Mode Latihan (Kuis):** Sistem tantangan interaktif untuk menguji kemampuan isyarat pengguna.
    - **Verifikasi Instan:** Feedback langsung apakah gestur yang diperagakan sudah benar.
    - **Umpan Balik Audio:** Narasi suara setiap huruf dan efek suara keberhasilan.
    - **Gamifikasi:** Efek visual perayaan (Confetti) saat berhasil menjawab tantangan.
    - **Overlay Referensi:** Bantuan visual langsung di layar kamera untuk mempermudah pemula.

### 📊 Dashboard Personal
- **Log Riwayat:** Mencatat setiap keberhasilan latihan secara otomatis.
- **Statistik Belajar:** Pantau jumlah huruf yang telah dikuasai dan aktivitas harian.
- **Local Storage:** Data progres tersimpan secara lokal di perangkat Anda.

---

## 📂 Struktur Proyek

```bash
├── web-app/                # Aplikasi Web (Next.js + TypeScript)
│   ├── app/                # Arsitektur Halaman (Home, Latihan, Panduan, Profil)
│   ├── components/         # Komponen UI Reusable
│   ├── hooks/              # Logika Bisnis & Pengelola State
│   └── public/             # Aset Statis (Model, Gambar, Suara)
│
├── model-training/         # Pipeline Pelatihan AI (Python)
│   ├── dataset/            # Data Latih (28 Kelas Huruf)
│   ├── train.py            # Skrip Pelatihan MobileNetV2
│   ├── data_collector.py   # Alat Pengumpul Dataset Mandiri
│   └── sync_assets.py      # Automasi Sinkronisasi Aset ke Web
```

---

## 🚀 Cara Menjalankan

### Persiapan
Pastikan sistem Anda sudah terinstal **Node.js** (v18+) dan **Python** (v3.9+).

### 1. Menjalankan Aplikasi Web
```bash
cd web-app
npm install
npm run dev
```
Akses aplikasi melalui: [http://localhost:3000](http://localhost:3000)

### 2. Manajemen Model & Aset (Python)
Memerlukan **Python 3.9 atau lebih baru**. Disarankan menggunakan *virtual environment* untuk menjaga isolasi dependensi.

```bash
cd model-training

# Membuat virtual environment (.venv)
python -m venv .venv

# Aktivasi .venv (Windows)
.\.venv\Scripts\activate

# Aktivasi .venv (macOS/Linux)
source .venv/bin/activate

# Instalasi dependensi
pip install -r requirements.txt

# --- Perintah Manajemen ---

# Mengumpulkan dataset baru
python data_collector.py 

# Melatih ulang model AI
python train.py

# Sinkronisasi otomatis gambar contoh ke aplikasi web
python sync_assets.py
```

---

## 🛠️ Teknologi yang Digunakan

*   **Frontend:** Next.js 14, Tailwind CSS, Lucide Icons, Radix UI
*   **Artificial Intelligence:** TensorFlow.js, MediaPipe Tasks Vision
*   **Deep Learning Model:** MobileNetV2 (CNN)
*   **Interaktivitas:** Web Speech API, Canvas Confetti

---

## 📝 Lisensi
© 2025 HijaiyahAI.
Dibuat untuk memajukan pendidikan bahasa Arab berbasis teknologi.