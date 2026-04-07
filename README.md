# 📱 SCAS Frontend: The Farmer's Portal

A modern, high-performance Progressive Web Application (PWA) built with Next.js 14, designed to work in the most challenging rural environments.

---

## 🚀 Core Features

### 1. 📴 SyncEngine v2.0 (Offline-First)
Powered by **Dexie.js** and **IndexedDB**. 
- Tickets are saved locally when offline.
- Automatic background sync triggers as soon as the browser detects a network restoration.
- Idempotent handshake ensures no duplicate reports reach the government servers.

### 2. 🛡️ User Personas & Dashboards
- **Farmer**: Submit tickets, view weather, track Carbon Credits.
- **Worker**: Receive localized assignments, upload Proof-of-Work (GPS + Photo).
- **Sub-Head/Admin**: High-level heatmaps, district analytics, and bulk broadcasts.

### 3. 🎤 Multi-Lingual & Voice First
- Integrated voice recording for hands-free advisory requests.
- Multilingual UI support for regional Hindi and local dialects (via 2026 L10n protocol).

---

## 🛠️ Internal Structure

- **`/lib/syncEngine.js`**: The heartbeat of the offline-first experience.
- **`/components/KrishiMitraChat.jsx`**: The AI-powered advisory interface.
- **`/app/dashboard/`**: Role-based routing and specialized views.
- **`/lib/socket.js`**: Real-time listeners for emergency and ticket alerts.

---

## 🚀 Deployment

- **Hosting**: Vercel (Production Build).
- **Env Config**: Managed via `.env.production`.
- **Live Site**: [https://scas-frontend-2026.vercel.app/](https://scas-frontend-2026.vercel.app/)

---

## 📦 PWA Support
- Manifest-ready for home screen installation.
- Service Worker integration for offline asset caching.

---
© 2026 SCAS Frontend Design Team.
