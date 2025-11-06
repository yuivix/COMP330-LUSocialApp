# COMP330-LUSocialApp

# 📘 LU Tutor – Cycle 1 Delivery

LU Tutor is a full-stack tutoring platform prototype built for Loyola University’s COMP 330 course.  
The app enables students to find tutors, request sessions, and manage upcoming bookings — while tutors can view and accept session requests.  

---

## 🚀 Tech Stack

| Layer | Technology | Description |
|-------|-------------|--------------|
| **Frontend** | React (Create React App), TailwindCSS | Deployed on Vercel |
| **Backend** | Node.js + Express | REST API hosted on Render |
| **Database** | PostgreSQL | Hosted on Render PostgreSQL instance |
| **Auth** | JWT (JSON Web Token) | Role-based authorization (student/tutor) |

---

## 🧩 Features (Cycle 1 MVP)

### ✅ Authentication & Authorization
- User registration and login with JWT-based sessions
- Role-based dashboards (Student vs Tutor)
- Password hashing and token verification

### ✅ Tutor Listings
- Tutors can create and view listings
- Students can search by title or subject

### ✅ Bookings Workflow
- Students send booking requests to tutors
- Tutors can view pending requests and accept them
- Shared PostgreSQL persistence ensures state sync between roles

### ✅ Deployment
- Frontend: Vercel (`https://lu-tutor-app.vercel.app`)
- Backend: Render (`https://comp330-lusocialapp.onrender.com`)
- Database: Render PostgreSQL

---

## 🖥️ Local Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yuivix/COMP330-LUSocialApp.git
cd COMP330-LUSocialApp


## 🌍 Live Deployment Links

| Component | URL | Description |
|------------|-----|-------------|
| **Frontend (Main App)** | https://lu-tutor-app.vercel.app | React web app for tutors and students |
| **Backend API** | https://comp330-lusocialapp.onrender.com | Node.js + Express server on Render |
| **Health Check Endpoint** | https://comp330-lusocialapp.onrender.com/health | Confirms API uptime |