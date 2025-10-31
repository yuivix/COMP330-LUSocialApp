import React from "react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome! How can we help?</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Upcoming Bookings</h2>
        <p>It's looking empty...</p>
      </section>
      <div className="flex space-x-4">
        <Link
          to="/find-tutors"
          className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white px-4 py-2 rounded"
        >
          Find Tutors
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;