# COMP330-LUSocialApp

# 📘 LU Tutor – Cycle 2 Final Delivery

LU Tutor is a full-stack tutoring platform prototype built for Loyola University Chicago.  
Students can find tutors, request sessions, and leave reviews. Tutors can publish listings, manage bookings, and receive feedback.

This README provides **full instructions so you can run both backend and frontend locally**.

---

## 🚀 Tech Stack

### **Frontend**
- React (Create React App)
- Runs locally on **http://localhost:3000**

### **Backend**
- Node.js + Express REST API
- Runs locally on **http://localhost:4000**

### **Database**
- PostgreSQL (local instance)
- Schema located at:  
  `backend/db/schema.sql`

### **Authentication**
- JWT (JSON Web Tokens)
- Role-based: **student** | **tutor**
- Required for protected routes

---

## ✅ Cycle 2 Features Delivered

### 1. Authentication & Authorization
- Register with `.edu` emails
- Login returns a JWT token
- Protected routes for student/tutor dashboards

### 2. Profiles (NEW)

#### Backend
- `GET /profiles/me` — fetch logged-in user profile  
- `PATCH /profiles/me` — update profile  
- `GET /profiles/:userId` — public tutor profile  

#### Frontend
- My Profile page (edit & save profile)
- Tutor Profile page (from listings)

### 3. Listings
- Tutor creates listings (subject, course code, rate, description)
- Students search listings with filters & pagination

**Endpoints:**  
- `GET /listings`  
- `POST /listings`  
- `PUT /listings/:id`  
- `GET /search?...`

### 4. Bookings Workflow (Updated)

#### Students can:
- Request tutoring sessions  
- View bookings by status: REQUESTED, ACCEPTED, COMPLETED, CANCELLED  

#### Tutors can:
- Accept booking requests  
- Cancel sessions  
- Mark completed sessions  

**Endpoints:**  
- `POST /bookings`  
- `POST /bookings/:id/accept`  
- `POST /bookings/:id/cancel`  
- `POST /bookings/:id/complete`  

### 5. Reviews (NEW)

#### Rules
- Student can review only after completed booking  
- One review per booking  
- Rating 1–5 with optional comment  

**Endpoints:**  
- `POST /reviews`  
- `GET /reviews?tutorId=...`

#### Frontend
- Leave review form  
- Display average rating  
- Show review list  

### 6. Notifications (Mock Only)
Backend includes a simple log-based notification system:

```js
sendEmail(to, templateId, params)
```

Logs to console — no real emails required.

---

## 🧰 HOW TO RUN LU-TUTOR LOCALLY

### 1️⃣ Clone the Repository

Open terminal:

```bash
git clone https://github.com/yuivix/COMP330-LUSocialApp.git
cd COMP330-LUSocialApp
```

### 2️⃣ Install & Prepare PostgreSQL

#### Step 1: Open PostgreSQL

**Mac/Linux:**
```bash
psql -U postgres
```

**Windows:**  
Open SQL Shell.

#### Step 2: Create the database

Inside psql:

```sql
CREATE DATABASE lututor;
\q
```

#### Step 3: Load the schema

From the project root:

```bash
psql -U postgres -d lututor -f backend/db/schema.sql
```

This creates all tables:
- users
- profiles
- tutor_listings
- bookings
- reviews

### 3️⃣ Backend Setup (Runs on port 4000)

Open a new terminal:

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/lututor
JWT_SECRET=supersecret123
PORT=4000
```

> **Note:** Replace `YOUR_PASSWORD` with your PostgreSQL password. If you don't have a password, remove `:YOUR_PASSWORD` from the URL.

Start backend:

```bash
npm run dev
```

You should see:

```
✅ PostgreSQL: pool connected
🚀 API running on http://localhost:4000
```

**Test backend:**  
Visit in browser:

```
http://localhost:4000/health
```

You should see:

```json
{ "ok": true, "time": "..." }
```

### 4️⃣ Frontend Setup (Runs on port 3000)

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:4000
```

Start frontend:

```bash
npm start
```

Then visit:

```
http://localhost:3000
```

---

## You should be able to:

1. **Register a new user** (requires `.edu` domain)  
   ex: `professor@luc.edu`

2. **Login**  
   JWT token is automatically used by frontend.

3. **Edit Profile**
   - Name
   - Bio
   - Major
   - Avatar URL
   - etc.

4. **As a Tutor**
   - Create a listing
   - Accept or cancel bookings
   - Mark a completed booking

5. **As a Student**
   - Search for listings
   - Request a booking
   - Leave a review after completion

---

## 📁 Project Structure

```
COMP330-LUSocialApp/
├── backend/
│   ├── src/modules/
│   │   ├── auth/
│   │   ├── profiles/
│   │   ├── listings/
│   │   ├── bookings/
│   │   ├── reviews/
│   │   └── search/
│   ├── db/schema.sql
│   ├── app.js
│   └── index.js
└── frontend/
    ├── src/
    ├── package.json
    └── .env
```

---

## 📎 Live/Remote Deployment (For History)

**Frontend (Vercel):**  
https://lu-tutor-app.vercel.app

**Backend (Render):**  
https://comp330-lusocialapp.onrender.com

---

## 📝 License

This project is created for educational purposes under the COMP330 course at Loyola University Chicago.
