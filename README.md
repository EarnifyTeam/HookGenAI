<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎬 HookGen AI

> **AI-powered bulk video analyzer** that generates catchy hook captions and hashtags for maximum social media reach — powered by Google Gemini.

[![Deploy to GitHub Pages](https://github.com/YOUR_USERNAME/HookGenAI/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/HookGenAI/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-emerald?style=flat&logo=github)](https://YOUR_USERNAME.github.io/HookGenAI/)

---

## ✨ Features

- 📹 **Bulk Upload** — Analyze up to 10 videos at once
- 🤖 **AI Hook Captions** — 4-5 catchy, high-engagement titles per video
- #️⃣ **Smart Hashtags** — 5 relevant hashtags generated automatically
- 🔑 **Bring Your Own Key** — Users can enter their own Gemini API key
- 📋 **One-Click Copy** — Copy captions and hashtags instantly
- 🌙 **Clean UI** — Modern, responsive design with smooth animations

---

## 🚀 Live Demo

👉 **[https://YOUR_USERNAME.github.io/HookGenAI/](https://YOUR_USERNAME.github.io/HookGenAI/)**

---

## 🛠️ Tech Stack

| Technology | Version |
|------------|---------|
| React | 19 |
| Vite | 6 |
| TypeScript | 5.8 |
| TailwindCSS | 4 |
| Google Gemini AI | Latest |
| Framer Motion | 12 |
| Lucide React | Latest |

---

## 🔧 Run Locally

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/HookGenAI.git
cd HookGenAI

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Add your Gemini API key to .env.local

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a free API key
3. Paste it in the app's **Settings** panel (gear icon) — or add to `.env.local`

---

## 🌐 Deploy to GitHub Pages

This project auto-deploys via **GitHub Actions** on every push to `main`.

**Setup Steps:**
1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Add a new secret: `GEMINI_API_KEY` = your Gemini API key
3. Go to **Settings** → **Pages** → Source: **GitHub Actions**
4. Push to `main` — it deploys automatically! ✅

---

## 📁 Project Structure

```
HookGenAI/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD
├── src/
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── index.html
├── vite.config.ts          # Vite + base path config
├── package.json
└── .env.example            # Environment variables template
```

---

## 👨‍💻 Developer

**Suraj Kumar** — Professional Web Developer

---

## 📄 License

Apache-2.0 License — see [LICENSE](LICENSE) for details.
