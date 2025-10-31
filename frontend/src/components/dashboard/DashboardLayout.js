import React from "react";
import { useState } from "react";
import Navbar from "../common/Navbar";
import StudentDashboard from "./StudentDashboard";
import TutorDashboard from "./TutorDashboard";
import { useAuth } from "../../contexts/AuthContext";

const DashboardLayout = () => {
    const { user } = useAuth();
  
    if (!user) {
      return <div className="p-6">Invalid: User not logged in</div>;
    }
  
    return (
      <div>
        <Navbar />
        <main className="mt-6 p-4">
          {user.role === "student" && <StudentDashboard />}
          {user.role === "tutor" && <TutorDashboard />}
        </main>
      </div>
    );
  };
  
export default DashboardLayout;  