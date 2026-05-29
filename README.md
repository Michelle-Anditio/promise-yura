<div align="center">
  <img src="/logo.png?v=yura-new" alt="Promise Yura Logo" width="100" height="100" style="border-radius: 24px;">
  
  # Promise Yura

  > AI-powered reminder companion and digital assistant that turns messy thoughts and voice input into clear promises/reminders harian.
</div>

[View Demo](https://ais-dev-voz5mgocxj2ljz2mhlb4me-49127804258.asia-east1.run.app) • [Report Bug](https://github.com/michelleanditio/promise-yura/issues/new?labels=bug) • [Request Feature](https://github.com/michelleanditio/promise-yura/issues/new?labels=enhancement)

---

## 📋 Daftar Isi

- [About The Project](#about-the-project)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Features](#features)
- [License](#license)
- [Contact](#contact)

---

## 📌 About The Project

**Promise Yura** adalah asisten pengingat interaktif berbasis kecerdasan buatan (AI) yang merevolusi cara Anda mendaftar dan menindaklanjuti janji ataupun komitmen sehari-hari. Sering kali dalam rutinitas harian, kita membuat agenda secara mendadak atau tidak terperinci melalui pesan suara spontan.

Promise Yura hadir sebagai solusi cerdas. Cukup ketuk ikon mikrofon dan bicaralah secara alami, bahkan dalam bahasa campuran (bilingual slang). Promise Yura akan secara pintar menyerap "pikiran berantakan" Anda, mengisolasi kata-kata pengisi percakapan, mengekstrak detail janji utama menggunakan AI, serta menyelaraskannya dengan maskot anjing pendamping yang hangat, **Yura**, yang bereaksi secara real-time terhadap penyelesaian janji dan interaksi suara Anda.

---

## 🛠️ Built With

- [![React][React.js]][React-url]
- [![Vite][Vite.dev]][Vite-url]
- [![Firebase][Firebase.com]][Firebase-url]
- [![Gemini API][Gemini.com]][Gemini-url]
- [![Lucide React][Lucide.dev]][Lucide-url]
- [![Tailwind CSS][Tailwind.com]][Tailwind-url]

---

## 🚀 Getting Started

### Prerequisites

* Node.js >= 18
* npm atau yarn
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone repository
   ```sh
   git clone https://github.com/michelleanditio/promise-yura.git
   ```
2. Masuk ke direktori project
   ```sh
   cd promise-yura
   ```
3. Install dependencies
   ```sh
   npm install
   ```
4. Buat file `.env` di root direktori dan masukkan credential/token Anda
   ```env
   # API Key untuk kecerdasan Yura Brain (Gemini API)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Detail Web Configuration Firebase untuk Sinkronisasi Real-Time
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_firebase_app_id_here
   ```
5. Jalankan development server
   ```sh
   npm run dev
   ```

---

## ✨ Features

### 1. **Voice-First Input (Raw Thoughts Capture)**
Ujarkan pikiran atau janji spontan secara bebas dalam bahasa Indonesia, Inggris, atau campuran slang bilingual sehari-hari (seperti *"mager"*, *"besok sore"*, *"pake"*, *"tolong ingetin"*). Sistem menyerap secara langsung tanpa perlu penulisan manual yang kaku.

### 2. **AI Action & Details Extraction**
Didukung oleh Gemini API SDK, Promise Yura mengekstrak secara cerdas parameter-parameter janji seperti judul tindakan yang berfokus, perkiraan tenggat tanggal, target waktu spesifik, tingkat kepanduan prioritas, hingga daftar checklist sub-tugas otomatis.

### 3. **Follow-Up & Edit Flow**
Jika detail yang terdeteksi kurang lengkap atau terdapat koreksi, alur koreksi intuitif bawaan memungkinkan Anda memperbarui parameter tanggal, waktu, atau catatan tambahan dengan mudah melalui visual panel yang ramah sebelum disimpan secara resmi.

### 4. **Three Intensity Modes (Gentle, Normal, Annoying)**
Sesuaikan seberapa gigih asisten Anda mengingatkan janji Anda:
*   📢 **Gentle**: Pengingat tenang berupa kartu berwarna lembut tanpa intervensi vokal atau getaran keras.
*   🔔 **Normal**: Pengingat harian bersahabat standar.
*   🚨 **Annoying**: Notifikasi persisten bersuara dan animasi Yura yang meminta penanganan segera untuk janji-janji yang sangat kritis.

### 5. **Interactive Animated Mascot (Yura Companion)**
Yura adalah sahabat setiamu! Dia beranimasi aktif dan menunjukkan ekspresi berbeda (senang, sedih saat janji kosong, berpikir keras saat merekam suara, bingung ketika masukan suara tidak terdeteksi, atau bangga saat Anda berhasil menyelesaikan komitmen harian).

### 6. **Firebase Active Cloud Storage & Auth**
Proses pendaftaran dan autentikasi instan menjaga data tersimpan aman. Sinkronisasi multi-perangkat real-time didukung sepenuhnya melalui model data awan Firestore untuk memastikan riwayat janji Anda tidak pernah hilang.

---

## 📄 License

Asisten digital Promise Yura ini gratis digunakan sebagai referensi asisten produktivitas personal terbuka.

---

## 📮 Contact

Project Link: [https://github.com/michelleanditio/promise-yura](https://github.com/michelleanditio/promise-yura)

Platform Demo: [https://ais-dev-voz5mgocxj2ljz2mhlb4me-49127804258.asia-east1.run.app](https://ais-dev-voz5mgocxj2ljz2mhlb4me-49127804258.asia-east1.run.app)

---

<!-- MARKDOWN LINKS & IMAGES -->
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vite.dev]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev
[Firebase.com]: https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white
[Firebase-url]: https://firebase.google.com
[Gemini.com]: https://img.shields.io/badge/Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white
[Gemini-url]: https://deepmind.google/technologies/gemini/
[Lucide.dev]: https://img.shields.io/badge/Lucide-F56565?style=for-the-badge&logo=lucide&logoColor=white
[Lucide-url]: https://lucide.dev
[Tailwind.com]: https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com
