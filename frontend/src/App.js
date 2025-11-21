import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyPage from "./pages/auth/VerifyPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ListingDetailPage from "./pages/listings/ListingDetailPage";

// NEW IMPORTS
import MyProfilePage from "./pages/profile/MyProfilePage";
import TutorProfilePage from "./pages/profile/TutorProfilePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/listings/:listingId"
            element={
              <ProtectedRoute>
                <ListingDetailPage />
              </ProtectedRoute>
            }
          />

          {/* 👉 NEW ROUTES */}

          {/* My Profile page for logged-in user */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MyProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Tutor public profile, reached from listing */}
          <Route
            path="/tutors/:userId"
            element={
              <ProtectedRoute>
                <TutorProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
