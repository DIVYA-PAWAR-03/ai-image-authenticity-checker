# 🛡️ AI-Powered Image Authenticity Checker

> **A Digital Safety Tool Designed for Elderly Users**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://www.android.com/)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![AI: PyTorch](https://img.shields.io/badge/AI-PyTorch-EE4C2C.svg)](https://pytorch.org/)

---

## 📌 What Is This?

This project helps **elderly users** easily detect whether an image they see on social media (Instagram, WhatsApp, Facebook, etc.) is **real** or **AI-generated** — with just **one tap**.

No downloading. No uploading to websites. No technical knowledge required.

---

## 🎯 The Problem We Solve

Elderly users are frequently exposed to **AI-generated fake images** on social media. Current AI detection tools require users to:
- Download the image
- Visit a website
- Upload it manually
- Understand technical results

This is too complex. Our app makes it as simple as:

> **See Image → Tap Button → Get Answer**

---

## 🔄 How It Works

```
1. User sees image on Instagram / WhatsApp / Facebook
2. Taps the floating "Check Image" button (screen overlay)
3. Captures the image or relevant screen area
4. Image is sent securely to our backend
5. AI model analyzes the image
6. Result is shown in large, simple, color-coded text:

   🟢 LIKELY REAL
   🔴 LIKELY AI-GENERATED
   🟡 UNCERTAIN — Please verify before sharing
```

---

## 🏗️ Architecture Overview

```
User Phone → Any Social Media App
    → Floating Check Image Button (Overlay)
    → Screen Capture (MediaProjection API)
    → React Native App
    → FastAPI Backend (Python)
    → Image Preprocessing (Pillow / OpenCV)
    → AI Model Inference (PyTorch / HuggingFace)
    → Decision Layer
        score > 0.70  →  🔴 LIKELY AI-GENERATED
        0.35 – 0.70   →  🟡 UNCERTAIN
        score < 0.35  →  🟢 LIKELY REAL
    → Result Screen (Large Text + Color)
```

---

## 🏛️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Android-first) |
| Screen Capture | Android MediaProjection API |
| Floating Button | Android WindowManager Overlay |
| Native Bridge | React Native Native Modules |
| Backend API | Python + FastAPI |
| AI/ML | PyTorch + HuggingFace Pretrained Model |
| Image Processing | Pillow + OpenCV |

---

## 👴 Elderly-Friendly Design Principles

- ✅ Large buttons (min 56dp touch targets)
- ✅ Large readable text (min 20sp font size)
- ✅ Simple plain-English explanations (no jargon)
- ✅ Clear color-coded results (🟢🔴🟡)
- ✅ Max 3 taps from start to result
- ✅ Optional voice readout (Text-to-Speech)
- ✅ High contrast UI

---

## 📁 Project Structure

```
ai-image-authenticity-checker/
│
├── README.md
├── .gitignore
│
├── backend/                         # FastAPI Backend (Python)
│   ├── main.py
│   ├── api/routes.py
│   ├── core/config.py
│   ├── core/decision.py
│   ├── ml/model_loader.py
│   ├── ml/predictor.py
│   ├── utils/image_processor.py
│   ├── utils/cleanup.py
│   └── requirements.txt
│
├── mobile/                          # React Native App (Android)
│   ├── android/
│   ├── src/screens/
│   ├── src/components/
│   ├── src/services/
│   └── package.json
│
└── docs/
    ├── architecture.md
    ├── model_evaluation.md
    └── privacy_policy.md
```

---

## 🔐 Privacy

- Images processed only on explicit user request
- No permanent storage of captured screenshots
- Temp files deleted immediately after analysis
- Users informed when image is being uploaded
- No personal information collected

---

## 🗺️ Development Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 0 | Project setup, folder structure, README | ✅ Done |
| Phase 1 | FastAPI backend + AI model integration | 🔲 Next |
| Phase 2 | React Native app (screens + API connection) | 🔲 Planned |
| Phase 3 | Android floating button + screen capture | 🔲 Planned |
| Phase 4 | UI polish, TTS, end-to-end testing | 🔲 Planned |
| Phase 5 | Future features (OCR, scam detection, voice) | 🔲 Future |

---

## 🚀 Future Scope

- 🖼️ AI-generated image detection (MVP)
- 📰 Fake/misleading image detection
- 🔍 OCR for text inside screenshots
- ⚠️ Scam/fraud message detection
- 🎙️ Voice-based assistance

---

*Built with ❤️ to help our elders navigate the digital world safely.*
