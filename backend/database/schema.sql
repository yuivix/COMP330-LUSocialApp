-- LUTutor Database Schema

-- Users table
CREATE TABLE users (
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
CREATE TABLE profiles (
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

-- Tutor listings table
CREATE TABLE tutor_listings (
  listing_id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  availability TEXT,
  location VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
  booking_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES tutor_listings(listing_id) ON DELETE CASCADE,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  session_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  booking_id INTEGER UNIQUE NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reviewee_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tutor_listings_tutor_id ON tutor_listings(tutor_id);
CREATE INDEX idx_tutor_listings_subject ON tutor_listings(subject);
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_bookings_tutor_id ON bookings(tutor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
