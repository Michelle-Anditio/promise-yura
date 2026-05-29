<div align="center">
  <img src="public/logo.png" alt="Promise Yura Logo" width="120" height="120" style="border-radius: 28px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
  
  # 🌸 Promise Yura

  **An AI-powered, voice-first promise companion and interactive digital assistant that transforms raw, messy verbal statements into clear, structured, and actionable reminders.**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)][React-url]
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)][Vite-url]
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)][Firebase-url]
  [![Gemini API](https://img.shields.io/badge/Gemini_AI-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)][Gemini-url]
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)][Tailwind-url]

  [Explore Live Demo](https://ais-dev-voz5mgocxj2ljz2mhlb4me-49127804258.asia-east1.run.app) • [Report a Bug](https://github.com/michelleanditio/promise-yura/issues/new?labels=bug) • [Request a Feature](https://github.com/michelleanditio/promise-yura/issues/new?labels=enhancement)
</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [How It Works](#-how-it-works)
- [Interactive Feature Matrix](#-interactive-feature-matrix)
- [The Yura Emotion Matrix](#%EF%B8%8F-the-yura-emotion-matrix)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setups](#installation--setups)
- [License](#-license)
- [Contact](#-contact)

---

## 📌 About The Project

> **"Often in our fast-paced daily routines, commitments are made spontaneously or left fragmented in unstructured raw thoughts. Promise Yura bridges this gap with responsive AI."**

**Promise Yura** is an eye-catching, responsive digital assistant and voice companion designed for recruiters, judges, and productivity enthusiasts alike. Built using **React (v19)**, **Vite**, **Tailwind CSS**, and **Framer Motion**, the application features **Yura**—an animated dog companion who reacts with dynamic expressions based on your microphone volume, database status, and promise lists.

Unlike traditional static todo lists, Promise Yura replaces rigid inputs with direct **natural speech**. By leveraging the official `@google/genai` TypeScript SDK and Firebase services, it accurately cleans bilingual filler words, extracts action parameters, categorizes critical priorities, and synchronizes your promises instantly across mobile and desktop environments.

---

## 🔄 How It Works

```
[Raw Voiced Thought] ➔ [Gemini Intelligent Clean] ➔ [Structured Action Parameters] ➔ [Yura Response Animation]
"mager banget tgl 30 jam 5      (Filler filter; parsing title,      Title: Submit Report             (Sleepy Mascot wakes up
sore submit report ya, tolong"    date, time & priority)           Due: 2026-05-30 @ 17:00          with a wink of approval!)
```

---

## ✨ Interactive Feature Matrix

The app's features are compartmentalized into modern functional circles to maximize clarity and highlight coding craftsmanship:

### 🎙️ 1. Voice Capture
* **Organic Vocal Scribing**: Input spontaneous promises using English, Indonesian, or casual bilingual slang without strict, frustrating syntax.
* **Smart Sound Capture**: Real-time noise status listeners change Yura's idle visuals into focused, deep-concentration states.

### 🧠 2. AI Understanding (Yura Brain)
* **Filler Redundancy Filtering**: The embedded LLM pipeline strips generic vocal pauses (*"uh"*, *"hmmm"*, *"kayaknya"*) to distill pure intent.
* **Automatic Parameter Allocation**: Deduces clean task headers, appropriate dates, target times, priority scale, and subtask checklists automatically.

### 🔔 3. Reminder Management
* **Adjustable Intensity Profiles**: Adapt reminder urgency levels via three targeted tiers:
  | Mode | Behavior | Animation Trigger |
  | :--- | :--- | :--- |
  | 📢 **Gentle** | Calm, color-shaded cards stay in local workspace without intrusive sound rings. | Sleepy / Cozy companion |
  | 🔔 **Normal** | Balanced periodic system alerts and workspace updates. | Confident wink |
  | 🚨 **Annoying** | Highly persistent alarm screens, recurring system tone chimes, and shaking alerts. | Panic / High urgency focus |

### 🎨 4. Companion User Experience (UX)
* **Responsive Visual State Engine**: Interactive UI layouts wrapped in subtle Framer Motion micro-interactions, complete with spring modals and responsive state transitions.
* **Autosync Database Engine**: Instant user registration, authentication gates, and persistent Cloud Firestore collections keep commitments secure.

---

## 🐶 The Yura Emotion Matrix

Promise Yura utilizes active React state-listeners to map real-time workflow statuses directly to custom emotional icons of our fluffy assistant, Yura:

| Companion Asset | Emotion Trigger | Mascot Context & Behavior |
|:---:|:---:|:--- |
| <img src="public/logo.png" width="48" height="48"> | **Warm Welcome** | Idle profile header greeting. |
| <img src="public/yura-wink.png" width="48" height="48"> | **Wink** | Success sound trigger after completing a major task! |
| <img src="public/yura-ganbatte.png" width="48" height="48"> | **Ganbatte** | Encouraging prompt when you review high-priority activities. |
| <img src="public/yura-sleep.png" width="48" height="48"> | **Sleepy** | Ambient rest state when there are zero promises pending. |
| <img src="public/yura-concern.png" width="48" height="48"> | **Concern** | Critical panic screen triggered in **Annoying Intensity** mode. |
| <img src="public/yura-question.png" width="48" height="48"> | **Question** | Displayed during voice processes when intent is partially vague. |
| <img src="public/yura-sad.png" width="48" height="48"> | **Sad** | Triggered when active commitments have passed their target hours. |
| <img src="public/yura-love.png" width="48" height="48"> | **Affection** | Heartfelt appreciation displayed on profile achievement unlocks. |

---

## 📂 Project Architecture

```bash
promise-yura/
├── public/                 # Dynamic companion graphics, web manifest & worker configs
│   ├── logo.png
│   ├── yura-wink.png
│   ├── gura-sleep.png
│   └── icons/
├── src/
│   ├── components/
│   │   └── profile/        # Reusable modal dialogues (Logout confirmations, custom tools)
│   ├── screens/
│   │   ├── MainScreens.tsx  # Interactive focus panel, details edit grid, settings cards
│   │   └── VoiceScreens.tsx # Audio levels hook, voice listeners, and transcription UI
│   ├── services/
│   │   ├── firebase.ts     # Firebase auth gateway & Firestore collection instances
│   │   ├── authService.ts  # Session token controls and user mapping
│   │   └── yuraBrain.ts    # Advanced Gemini model integration and language logic
│   ├── App.tsx             # Central application navigation node & global state provider
│   ├── main.tsx            # Global bootstrap react launcher
│   └── index.css           # Tailwind CSS integration core stylesheet
├── .env.example            # Environment properties boilerplate layout
├── firestore.rules         # High-security production cloud database constraints
└── package.json            # Dynamic script controls and library declarations
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: Version 18.x or higher is highly recommended.
* **Package Manager**: npm (v9+) or Yarn.
  ```sh
  npm install npm@latest -g
  ```

### Installation & Setups

1. **Clone the Source Code**:
   ```sh
   git clone https://github.com/michelleanditio/promise-yura.git
   cd promise-yura
   ```

2. **Acquire Node Packages**:
   ```sh
   npm install
   ```

3. **Configure Your Environment Variables**:
   Create a `.env` configuration file in your project's root folder utilizing our clean template:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and configure your credentials safely (never check this into your public repository):
   ```env
   # Google Gemini API Key
   VITE_GEMINI_API_KEY="your_personal_gemini_api_key"

   # Firebase Configuration Web Credentials
   VITE_FIREBASE_API_KEY="AIzaSyYourApiKeyHere..."
   VITE_FIREBASE_AUTH_DOMAIN="promise-yura.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="promise-yura"
   VITE_FIREBASE_STORAGE_BUCKET="promise-yura.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   VITE_FIREBASE_APP_ID="your_target_app_id"
   ```

4. **Boot Local Development Workspace**:
   ```sh
   npm run dev
   ```
   *Your app will immediately be active at [http://localhost:3000](http://localhost:3000)*

5. **Linter Verify**:
   Run safety tests to ensure production compatibility:
   ```sh
   npm run lint
   ```

---

## 📄 License

Promise Yura is licensed as an open source project available to scholars, developers, and portfolios alike.

---

## 📮 Contact

* **Developer Email**: michelle.anditio6@gmail.com
* **Project Webpage**: [GitHub - michelleanditio/promise-yura](https://github.com/michelleanditio/promise-yura)
* **Application Live Demo**: [Interactive Platform Link](https://ais-dev-voz5mgocxj2ljz2mhlb4me-49127804258.asia-east1.run.app)

---

<!-- MARKDOWN LINKS & IMAGES REFERENCE -->
[React-url]: https://react.dev/
[Vite-url]: https://vite.dev/
[Firebase-url]: https://firebase.google.com/
[Gemini-url]: https://deepmind.google/technologies/gemini/
[Lucide-url]: https://lucide.dev/
[Tailwind-url]: https://tailwindcss.com/
