# CDSS «Острый живот» 2026 · CDSS Acute Abdomen 2026

**Клиническая система поддержки решений — молекулярная навигация в ургентной хирургии**
*Clinical decision support system — molecular navigation in emergency abdominal surgery*

[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-14b8a6)](https://serg2206.github.io/cdss-ostry-zhivot-2026/)
[![Deploy](https://github.com/Serg2206/cdss-ostry-zhivot-2026/actions/workflows/deploy.yml/badge.svg)](https://github.com/Serg2206/cdss-ostry-zhivot-2026/actions/workflows/deploy.yml)
![Version](https://img.shields.io/badge/version-3.1.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)

🔗 **Live demo:** https://serg2206.github.io/cdss-ostry-zhivot-2026/

> ⚠️ **Medical disclaimer.** This software is an educational and reference tool for qualified healthcare professionals. It does **not** replace clinical judgement, institutional protocols or current guidelines, and is **not** a certified medical device. All thresholds and algorithms must be verified against up-to-date sources before clinical use.
>
> ⚠️ **Медицинский дисклеймер.** Приложение — образовательный и справочный инструмент для врачей. Оно **не заменяет** клиническое мышление, локальные протоколы и действующие рекомендации и **не является** сертифицированным медицинским изделием.

---

## 🇬🇧 About

**CDSS Acute Abdomen 2026** is a single-page web application that supports surgeons and emergency physicians in the early assessment of the acute abdomen. It connects the **molecular pathogenesis** of abdominal catastrophe (the TISCPA cytokine cascade) with **bedside biomarkers**, **"masks" of the acute abdomen** (non-surgical mimics), **validated scoring systems** and **interactive decision algorithms** — covering the full chain of clinical reasoning from molecular mechanisms to the operative decision.

The interface is in Russian; the app runs entirely in the browser (no backend, no patient data leaves the device).

## 🇷🇺 О проекте

**CDSS «Острый живот» 2026** — веб-приложение для хирургов и врачей неотложной помощи, поддерживающее раннюю оценку пациента с острым животом. Система связывает **молекулярный патогенез** абдоминальной катастрофы (каскад цитокинов TISCPA) с **биомаркерами у постели больного**, **«масками» острого живота** (нехирургическими мимиками), **валидированными шкалами** и **интерактивными алгоритмами** — полный цикл клинического мышления: от молекулярных механизмов до решения об операции.

Интерфейс на русском языке; приложение полностью работает в браузере (без сервера, данные пациента не покидают устройство).

---

## 🩺 Clinical scope · Клинический охват

| Area / Область | Content / Содержание |
| :--- | :--- |
| **Molecular pathogenesis** / Молекулярный патогенез | TISCPA cascade timeline: TNF-α → IL-1β → IL-6 → IL-10 → PCT → CRP (peak times, clinical meaning) |
| **Biomarkers** / Биомаркеры | D-lactate, I-FABP, PCT, CRP, PLA2-II, monocyte HLA-DR — severity thresholds (normal / moderate / severe) and biomarker profiles for peritonitis, intestinal ischaemia, diabetic ketoacidosis, pancreatic necrosis |
| **Differential diagnosis — "masks"** / «Маски» острого живота | DKA, Addisonian crisis, sickle-cell crisis, acute porphyria, inferior myocardial infarction, pulmonary embolism, aortic dissection — each with its key discriminating test (ECG + troponin, glucose + ketones, cortisol + ACTH, HbS, urinary porphobilinogen, D-dimer + SpO₂, CT aortography) |
| **Scoring systems** / Шкалы | Mannheim Peritonitis Index (MPI), qSOFA (Sepsis-3), APACHE II — interactive calculators with risk interpretation |
| **Decision trees** / Алгоритмы | Sudden "dagger" pain · Deceptive well-being (hidden instability) · Elderly patient · Repeat presentation |
| **Emergency protocols** / Протоколы | Septic shock — the first ("golden") hour · DKA · Addisonian crisis · Mesenteric ischaemia (WSES-based, expandable step-by-step) |
| **Checklists** / Чек-листы | Pre-operative checklists for emergency laparotomy and thoracotomy |

---

## ✨ Features · Возможности

| Route | Module | Description |
| :--- | :--- | :--- |
| `/` | Home | Overview of modules + quick qSOFA calculator with **PDF export** |
| `/molecular` | Модуль А — Молекулярный патогенез | Interactive TISCPA cytokine cascade (TNF-α, IL-1β, IL-6, CRP, PCT, IL-10) |
| `/biomarkers` | Модуль Б — Биомаркерная навигация | Biomarker reference, disease profiles and the **biomarker calculator** (Pro) with version-aware thresholds |
| `/diagnostics` | Модуль В — Маски острого живота | 7 non-surgical mimics vs peritonitis, discriminating tests |
| `/algorithms` | Алгоритмы и чек-листы | Tabs: decision trees · checklists · scoring systems (MPI, qSOFA, APACHE II) · emergency protocols |
| `/tests` | Тесты для самопроверки | Cytokine timeline ordering, biomarker-based differential diagnosis cases, cognitive traps in diagnosis — with results summary |
| `/reference` | Справочник | Quick reference cards: qSOFA criteria, biomarkers, DKA vs peritonitis, pancreatitis, cholecystitis, bowel obstruction, cytokines, SOFA, MPI, pre-op checklist |

**Cross-cutting features**

- 🗂 **Guideline version selector (2024 / 2025 / 2026)** — switches biomarker thresholds; the selection is stored in `localStorage`.
- 💬 **Clinical assistant chat** — an offline, rule-based knowledge base (keyword matching) on cytokines, D-lactate, I-FABP, PCT, appendicitis (Alvarado), pancreatitis (BISAP), qSOFA/SOFA, lactate, HLA-DR, peritonitis and PLA2. *No external AI/LLM API is called.*
- 📄 **Export** — PDF (jsPDF + html2canvas) and JSON helpers.
- 📱 **PWA** — web app manifest + service worker (network-first with cache fallback for previously visited resources).
- 🔐 **Pro tier (optional)** — the biomarker calculator can be gated behind a Stripe Payment Link; a 24-hour *Demo Pro* mode is built in for presentations.

---

## 🛠 Tech stack · Технологии

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS 3.4** + **shadcn/ui** (Radix UI primitives), `lucide-react` icons
- **React Router 7** — client-side routing
- **Framer Motion**, **GSAP** — animations
- **Recharts** — charts
- **jsPDF**, **html2canvas** — PDF export
- **GitHub Actions → GitHub Pages** — CI/CD (`.github/workflows/deploy.yml`)

---

## 🚀 Getting started · Запуск

Requirements: **Node.js 20+**, npm.

```bash
git clone https://github.com/Serg2206/cdss-ostry-zhivot-2026.git
cd cdss-ostry-zhivot-2026
npm install
npm run dev        # http://localhost:3000/cdss-ostry-zhivot-2026/
```

| Script | Action |
| :--- | :--- |
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Type-check (`tsc -b`) and production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

### Configuration · Настройка

Copy `.env.example` to `.env` (optional):

```bash
# Stripe Payment Link for the Pro tier (optional)
# Placeholder — replace with your own Stripe Payment Link
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/your-link
```

Without it, Pro features can be unlocked for testing with the **Demo Pro** button (24-hour demo, stored in `localStorage`).

### Deployment · Деплой

Every push to `main` builds the app and publishes `dist/` to GitHub Pages. The Vite `base` is set to `/cdss-ostry-zhivot-2026/` — change it in `vite.config.ts` (and the paths in `public/sw.js`) if you deploy under a different path.

---

## 📁 Project structure · Структура

```
src/
├── App.tsx                 # Routes
├── main.tsx                # Entry point + service worker registration
├── pages/
│   ├── Home.tsx            # Landing + qSOFA quick calculator
│   ├── Molecular.tsx       # Module A — TISCPA cytokine cascade
│   ├── Biomarkers.tsx      # Module B — biomarker navigation (Pro calculator)
│   ├── Diagnostics.tsx     # Module C — masks of the acute abdomen
│   ├── Algorithms.tsx      # Tabs container
│   ├── algorithms/
│   │   ├── DecisionTrees.tsx
│   │   ├── Checklists.tsx
│   │   ├── ScoringSystems.tsx      # MPI · qSOFA · APACHE II
│   │   └── EmergencyProtocols.tsx
│   ├── Tests.tsx           # Self-assessment
│   └── Reference.tsx       # Quick reference
├── components/             # Navbar, Hero, Features, ChatWidget, ProLock, VersionSelector, ui/ (shadcn)
├── hooks/                  # useSubscription (Pro / demo), use-mobile
└── lib/                    # versions.ts (guideline thresholds), export.ts (PDF / JSON)
```

---

## 🤝 Contributing · Участие

Clinical feedback, corrections of thresholds with references, and pull requests are welcome. Please open an issue describing the clinical rationale and source (guideline, DOI) for any change to scores, thresholds or algorithms.

## 📄 License · Лицензия

© 2026 Sergiy V. Sushkov. All rights reserved.

## 👨‍⚕️ Author · Автор

**Prof. Sergiy V. Sushkov, MD, PhD** — surgeon, oncologic surgeon, medical educator (Kharkiv, Ukraine 🇺🇦)

🌐 [ssvnauka.com](https://ssvnauka.com) · 🔬 [ORCID 0000-0002-6951-9789](https://orcid.org/0000-0002-6951-9789) · 🐙 [GitHub @Serg2206](https://github.com/Serg2206) · 📨 [Telegram](https://t.me/SSVproff)
