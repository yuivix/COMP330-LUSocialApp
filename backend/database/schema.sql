-- LUTutor Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'tutor')),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  bio TEXT,
  profile_picture_url VARCHAR(500),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TUTOR LISTINGS ==========
-- For fresh databases:
CREATE TABLE IF NOT EXISTS tutor_listings (
  listing_id   SERIAL PRIMARY KEY,
  tutor_id     INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject      VARCHAR(100) NOT NULL,
  hourly_rate  NUMERIC(10,2) NOT NULL,
  availability TEXT,
  location     VARCHAR(255),
  description  TEXT,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- For existing databases: add new columns if missing
ALTER TABLE tutor_listings
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS course_code TEXT;

-- Helpful indexes (safe to repeat)
CREATE INDEX IF NOT EXISTS idx_tutor_listings_tutor_id ON tutor_listings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_listings_subject ON tutor_listings(subject);

-- Optional: view that FE/queries can SELECT from with a stable shape
CREATE OR REPLACE VIEW listings_view AS
SELECT
  listing_id,
  tutor_id,
  COALESCE(title, subject) AS title,
  subject,
  course_code,
  hourly_rate,
  description,
  location,
  is_active,
  created_at,
  updated_at
FROM tutor_listings
WHERE is_active = true;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  booking_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES tutor_listings(listing_id) ON DELETE CASCADE,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  session_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  review_id SERIAL PRIMARY KEY,
  booking_id INTEGER UNIQUE NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reviewee_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tutor_listings_tutor_id ON tutor_listings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_listings_subject ON tutor_listings(subject);
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor_id ON bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
