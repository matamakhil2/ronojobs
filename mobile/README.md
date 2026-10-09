# RonoJobs Mobile App (Frontend)

RonoJobs Hiring Platform mobile application built with React Native, Expo (SDK 54), TypeScript, and Expo Router.

## Features
- **Candidate Hub:** Explore jobs, search & multi-facet filters, instant application flow, profile management, bookmarking/saved jobs.
- **Employer Hub:** Company dashboard, post new vacancies, manage active/closed listings, review applicants, recruiter operations.
- **Modern UI & Micro-interactions:** Premium design system, responsive layout, tab auto-reset scroll navigation.
- **Cross-Platform:** Android APK (EAS Build configured) & iOS compatible.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- Expo Go app on your physical mobile device OR Android Emulator / iOS Simulator

### 2. Installation
```bash
npm install
```

### 3. Run Locally (Development)
```bash
npx expo start
```
Scan the QR code with **Expo Go** on Android or the Camera app on iOS.

### 4. Build Standalone APK
The app is configured for EAS builds (`eas.json`):
```bash
# Build preview APK directly for Android:
eas build -p android --profile preview
```

---

## Tech Stack
- **Framework:** React Native with Expo SDK 54
- **Navigation:** Expo Router (File-based routing)
- **Icons:** Expo Vector Icons (Ionicons)
- **HTTP Client:** Axios with JWT auto-interceptor
