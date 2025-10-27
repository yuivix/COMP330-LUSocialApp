import React from "react";
import { Link } from "react-router-dom";

const TutorDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome! What are you looking for today?</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Pending Booking Requests</h2>
        <p>No pending requests.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold">My Listings</h2>
        <p>No listings yet.</p>
      </section>
    </div>
  );
};

export default TutorDashboard;