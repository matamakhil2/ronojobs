# RonoJobs – Hiring Platform 🚀

A modern full-stack hiring platform connecting **job seekers** and **employers**, built according to the **RonoJobs Business Requirements Document (BRD)**.

---

## 🏗️ Architecture & Technology Stack

```text
React Native (Expo + TypeScript + Expo Router)
                    ↓
             REST API (/api/v1)
                    ↓
       Node.js + Express + TypeScript
                    ↓
        PostgreSQL (pg driver)
                    ↓
      Render Web Service & Database
```

### 📱 Mobile App (`/mobile`)
* **Framework:** React Native with Expo SDK 52
* **Navigation:** Expo Router (file-based tab and stack navigation)
* **Language:** TypeScript
* **State & Auth:** React Context + AsyncStorage token persistence
* **Platforms:** iOS, Android, and Web (`expo start --web`)

### 🖥️ Backend API (`/backend`)
* **Runtime:** Node.js (v20+)
* **Framework:** Express.js + TypeScript
* **Database Driver:** `pg` (PostgreSQL Connection Pooling)
* **Security:** JWT authentication, bcryptjs password hashing, role-based access control, parameterized SQL queries
* **Deployment:** Render-ready (`render.yaml` Blueprint & Dockerfile)

---

## 📁 Repository Structure

```text
Ronojobs/
├── render.yaml                   # Infrastructure-as-code for Render deployment
├── README.md                     # Complete project documentation
├── backend/                      # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── config/               # Database pool & environment variables
│   │   ├── controllers/          # Auth, Jobs, Applications, Saved, Profile, Employer
│   │   ├── db/                   # schema.sql, migrate.ts, seed.ts
│   │   ├── middleware/           # auth (JWT & RBAC), error handler
│   │   ├── routes/               # /api/v1 endpoints
│   │   ├── utils/                # JWT utilities
│   │   ├── app.ts                # Express app setup & CORS
│   │   └── server.ts             # Server entry point
│   ├── Dockerfile                # Production multi-stage Docker build
│   ├── package.json
│   └── tsconfig.json
└── mobile/                       # React Native Expo Mobile App
    ├── app/                      # Expo Router screens
    │   ├── _layout.tsx           # Root provider stack
    │   ├── index.tsx             # Splash & Onboarding
    │   ├── (auth)/               # Login & Register screens
    │   ├── (tabs)/               # Bottom Tabs (Jobs, Search, Saved, Applications, Profile)
    │   ├── job/[id].tsx          # Job Details & Apply modal
    │   └── employer/             # Employer Dashboard, Post Job, Applicants Review
    ├── src/
    │   ├── components/           # JobCard, ApplicationCard, StatusBadge, CategoryChip, etc.
    │   ├── constants/            # Design system, colors, shadows, tokens
    │   ├── context/              # AuthContext & Demo user switchers
    │   ├── services/             # Universal API client with fallback data
    │   └── types/                # Shared TypeScript models
    ├── app.json
    ├── package.json
    └── tsconfig.json
```

---

## 👥 User Roles & Features

### 1. 🎓 Candidate Features
* **Authentication:** Register, Login, Logout, Demo Quick-Fill.
* **Home Feed:** Search jobs, featured & recent listings, category chips.
* **Job Search & Filters:** Multi-criteria filter by Title, Location, Experience Level, Employment Type, and Skills.
* **Job Details:** Comprehensive salary, required skills, company profile, and description.
* **One-Click Apply:** Submit application with custom cover note and resume link. Prevents duplicate applications.
* **Saved Jobs:** Bookmark opportunities to track or apply later.
* **Application Tracker:** Live visual progression pipeline:
  $$\text{Applied} \longrightarrow \text{Shortlisted} \longrightarrow \text{Interview} \longrightarrow \text{Selected / Rejected}$$
* **Profile Management:** Edit full name, contact info, headline, skills, years of experience, education, bio, and resume.

### 2. 🏢 Employer Features
* **Employer Dashboard:** View all posted vacancies with applicant counts and hiring stage breakdown.
* **Post & Edit Jobs:** Define title, category, employment type, location, experience level, salary range, skills, and detailed job description.
* **Candidate Review:** Inspect applicant list per job, view candidate resumes and profiles.
* **Pipeline Management:** Move applicants across hiring stages (`Applied`, `Shortlisted`, `Interview`, `Selected`, `Rejected`).

---

## ⚡ Quick Start Guide

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your .env file
copy .env.example .env
```

Edit `.env` with your PostgreSQL database credentials:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/ronojobs
JWT_SECRET=ronojobs-dev-super-secret-key-2025
JWT_EXPIRES_IN=7d
```

Run database migrations and initial seed data:
```bash
# Run schema migrations and seeds
npm run db:setup

# Start development server with hot-reload
npm run dev

# Or build and start production
npm run build
npm start
```
* Backend will be running at: `http://localhost:5000`
* Health Check endpoint: `http://localhost:5000/api/v1/health`

---

### 2. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install --legacy-peer-deps

# Start Expo dev server
npm run start

# Or open in Web Browser directly:
npm run web
```

Press:
* `w` to open in Web browser
* `a` for Android Emulator
* `i` for iOS Simulator
* Scan the QR code with **Expo Go** on your physical phone!

---

## 🔑 Demo Credentials

| Role | Email | Password | Pre-configured Data |
| :--- | :--- | :--- | :--- |
| **Candidate** | `alex.dev@gmail.com` | `Candidate@123` | Full Stack Engineer profile, applications, saved jobs |
| **Candidate** | `sarah.ux@gmail.com` | `Candidate@123` | Product Designer profile |
| **Employer** | `recruiter@techcorp.com` | `Employer@123` | CloudScale Technologies company, 2 posted jobs |
| **Employer** | `talent@fintechpay.com` | `Employer@123` | PayPulse Global company, 2 posted jobs |
| **Admin** | `admin@ronojobs.com` | `Admin@123` | Full platform administrative access |

*(The mobile login screen also provides 1-click **Quick Auto-Fill** buttons for immediate testing without typing!)*

---

## 🌐 Render Deployment Guide

The project includes automated deployment support using Render Blueprints.

1. Push this repository to GitHub or GitLab.
2. In your Render Dashboard, click **New +** → **Blueprint**.
3. Select your repository. Render will automatically parse [render.yaml](file:///d:/Ronojobs/render.yaml) and provision:
   * **`ronojobs-backend`:** Node.js Web Service running `npm run build && npm start`
   * **`ronojobs-db`:** Managed PostgreSQL database
4. Once deployed, copy your Render Web Service URL (e.g. `https://ronojobs-backend.onrender.com/api/v1`).
5. Update `DEFAULT_API_URL` in [api.ts](file:///d:/Ronojobs/mobile/src/services/api.ts) or set it inside the mobile app!

---

## 📡 REST API Reference (`/api/v1`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | No | Register new candidate or employer |
| `POST` | `/auth/login` | No | Login and receive JWT token |
| `GET` | `/auth/me` | Bearer Token | Get current authenticated user profile |
| `GET` | `/jobs` | Optional | Search & filter jobs (q, category, location, skills, type) |
| `GET` | `/jobs/:id` | Optional | Get detailed job posting with application/saved status |
| `POST` | `/jobs` | Employer/Admin | Create a new job vacancy |
| `PUT` | `/jobs/:id` | Employer Owner | Update an existing job vacancy |
| `DELETE` | `/jobs/:id` | Employer Owner | Delete job vacancy |
| `POST` | `/jobs/:id/apply` | Candidate | Apply for a job (prevents duplicates) |
| `POST` | `/jobs/:id/save` | Candidate | Bookmark a job |
| `DELETE` | `/jobs/:id/save` | Candidate | Remove bookmark |
| `GET` | `/saved-jobs` | Candidate | View candidate's bookmarked jobs |
| `GET` | `/applications` | Candidate | View candidate's applied jobs with pipeline status |
| `GET` | `/applications/:id` | Owner/Employer | Get application details |
| `PATCH` | `/applications/:id/status`| Employer | Update application status (`Applied` $\rightarrow$ `Selected`) |
| `GET` | `/profile` | Bearer Token | Retrieve user profile (Candidate or Company) |
| `PUT` | `/profile` | Bearer Token | Update user profile |
| `GET` | `/employer/jobs` | Employer | List employer's jobs with applicant stats |
| `GET` | `/employer/jobs/:id/applicants` | Employer | View applicants for a specific job |
| `GET` | `/employer/stats` | Employer | View employer hiring metrics |
| `GET` | `/meta/skills` | No | List of platform skills |
| `GET` | `/meta/categories` | No | List of job categories with counts |
| `GET` | `/health` | No | Health check endpoint |
