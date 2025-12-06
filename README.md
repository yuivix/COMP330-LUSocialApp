# COMP330-LUSocialApp

# LU Tutor – Cycle 2 Final Delivery

LU Tutor is a full-stack tutoring platform prototype built for Loyola University Chicago.  
It allows **students** to find tutors, request and manage sessions, and leave reviews, while **tutors** can post listings, manage bookings, and see feedback.

This README reflects the **final Cycle 2 version**.

---

## 🚀 Tech Stack

### Frontend
- **React** (Create React App)
- Runs locally on **http://localhost:3000**

### Backend
- **Node.js + Express**
- REST API running on **http://localhost:4000**
cd 
### Database
- **PostgreSQL**
- Local instance (schema provided in `backend/db/schema.sql`)

### Authentication
- **JWT (JSON Web Tokens)**
- Role-based: `student` and `tutor`
- Tokens issued on login and used on protected endpoints

---

## ✅ Features – Cycle 2

### 1. Authentication & Authorization
- Register with `.edu` email and password
- Login returns JWT token
- Role-based behavior for:
  - Student dashboard
  - Tutor dashboard
- Protected routes on frontend and backend using JWT

### 2. Profiles (NEW in Cycle 2)

#### Backend
- `GET /profiles/me` – returns the logged-in user's profile
- `PATCH /profiles/me` – updates profile fields
- `GET /profiles/:userId` – public tutor profile

#### Frontend
- **My Profile** page:
  - View and edit `firstName`, `lastName`, `university`, `major`, `year`, `bio`, `avatarUrl`
- **Tutor Profile View**:
  - From a listing, users can jump to the tutor's profile
  - Shows name, university, bio, and reviews

### 3. Listings
- Tutors can create and manage listings (subject, course code, hourly rate, description)
- Students can search listings with:
  - Text search
  - Filters (subject, course code)
  - Pagination

#### Key Endpoints
- `GET /listings`
- `POST /listings`
- `PUT /listings/:id`
- `PATCH /listings/:id/active`
- `GET /search?subject=...&courseCode=...&page=...`

### 4. Bookings Workflow (Extended in Cycle 2)

#### Student
- Request sessions from a listing
- View bookings by status:
  - `REQUESTED`
  - `ACCEPTED`
  - `COMPLETED`
  - `CANCELLED`

#### Tutor
- View incoming requests
- Accept or cancel requests
- Mark accepted bookings as **COMPLETED**

#### Key Endpoints
- `POST /bookings` – create booking
- `GET /bookings?role=student` – bookings as a student
- `GET /bookings?role=tutor` – bookings as a tutor
- `POST /bookings/:id/accept`
- `POST /bookings/:id/cancel`
- `POST /bookings/:id/complete`

### 5. Reviews (NEW in Cycle 2)

#### Rules
- Only the **student on a completed booking** can leave a review
- Exactly **one review per booking**
- Rating is between **1–5**, with optional text comment

#### Backend
- `POST /reviews`
  - Body: `{ "bookingId", "rating", "comment" }`
- `GET /reviews?tutorId=...&page=...`
  - Returns:
    - `averageRating`
    - `total`
    - `page`, `pageSize`
    - `reviews[]` (rating, comment, createdAt, reviewer name)

#### Frontend
- "Leave Review" form available for completed bookings
- Reviews visible on tutor-related views
- Displays average rating and list of recent reviews

### 6. Notifications (Logging Adapter)
- Simple email "adapter" implemented as logging only:
  - `sendEmail(to, templateId, params)`
- Called when:
  - Booking is requested
  - Booking is accepted
- Output appears in backend logs as `[EMAIL] { ... }`
- No real email provider or paid service required

---

## 🧰 Local Setup & Running Instructions

These are the steps your professor can follow to run LU Tutor locally.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yuivix/COMP330-LUSocialApp.git
cd COMP330-LUSocialApp
```

### 2️⃣ Setup PostgreSQL Database

Open psql and run:
```sql
CREATE DATABASE lututor;
\c lututor;
```

Then, run the schema file found at:
```
backend/db/schema.sql
```

(e.g., copy-paste its contents into psql or use `\i path/to/schema.sql`)

### 3️⃣ Backend Setup (Port 4000)
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
DATABASE_URL=postgresql://<YOUR_DB_USER>@localhost/lututor
JWT_SECRET=supersecret123
PORT=4000
```

Start the backend:
```bash
npm run dev
```

You should see logs like:
```
✅ PostgreSQL: pool connected
✅ Database connected at: ...
✅ Users table accessible, count: ...
🚀 API running on http://localhost:4000
```

Health check:

Browser or Bruno/Postman: http://localhost:4000/health

### 4️⃣ Frontend Setup (Port 3000)

In a new terminal:
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
REACT_APP_API_URL=http://localhost:4000
```

Start the frontend:
```bash
npm start
```

Visit:
```
http://localhost:3000
```

You should be able to:

- Register a `.edu` user
- Login
- Edit profile
- View/create listings
- Request and update bookings
- Leave a review on a completed booking

---

## 📝 License

This project is for educational purposes as part of COMP330 at Loyola University Chicago.