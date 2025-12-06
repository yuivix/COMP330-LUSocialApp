// frontend/src/pages/listings/ListingDetailPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

async function apiFetch(path, { method = "GET", headers = {}, body } = {}) {
  const userStr = localStorage.getItem("user");
  const token = userStr ? JSON.parse(userStr).token : null;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const err = new Error(
      data?.message || data?.error || `Request failed (${res.status})`
    );
    err.status = res.status;
    throw err;
  }
  return data;
}

const ListingDetailPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking / request state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Tutor profile modal state (TASK B)
  const [showTutorProfile, setShowTutorProfile] = useState(false);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState(null);

  useEffect(() => {
    fetchListingDetails();
  }, [listingId]);

  async function fetchListingDetails() {
    try {
      setLoading(true);
      setError(null);
      // Fetch all listings and find the one we need
      const data = await apiFetch(`/listings`);
      const numericId = parseInt(listingId, 10);
      const foundListing = data.find(
        (l) => l.listing_id === numericId || l.id === numericId
      );

      if (foundListing) {
        setListing(foundListing);
      } else {
        setError("Listing not found");
      }
    } catch (err) {
      setError(err.message || "Failed to load listing");
    } finally {
      setLoading(false);
    }
  }

  async function handleBookingSubmit(e) {
    e.preventDefault();
    setBookingError(null);

    if (!startTime || !endTime) {
      setBookingError("Please provide both start and end times");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Validate start time is in the future
    if (start <= now) {
      setBookingError("Start time must be in the future");
      return;
    }

    if (end <= start) {
      setBookingError("End time must be after start time");
      return;
    }

    // Validate session duration (min 30 mins, max 4 hours)
    const durationHours = (end - start) / (1000 * 60 * 60);
    if (durationHours < 0.5) {
      setBookingError("Session must be at least 30 minutes");
      return;
    }
    if (durationHours > 4) {
      setBookingError("Session cannot exceed 4 hours");
      return;
    }

    try {
      setSubmitting(true);
      await apiFetch("/bookings", {
        method: "POST",
        body: {
          listing_id: listing.listing_id || listing.id,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          note: notes.trim() || undefined,
        },
      });

      setBookingSuccess(true);
      setShowBookingForm(false);
      setStartTime("");
      setEndTime("");
      setNotes("");

      // Hide success message after 5 seconds
      setTimeout(() => setBookingSuccess(false), 5000);
    } catch (err) {
      // Handle specific error cases
      if (err.status === 401) {
        setBookingError("Please log in to book a session");
      } else if (err.status === 400) {
        setBookingError(err.message || "Invalid booking details. Please check your inputs.");
      } else if (err.status === 409) {
        setBookingError("This time slot conflicts with an existing booking");
      } else {
        setBookingError(err.message || "Failed to create booking. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // === TASK B: View Tutor Profile ===
  async function handleViewTutorProfile() {
    if (!listing) return;

    const tutorId = listing.tutor_id || listing.tutorId;
    if (!tutorId) {
      setShowTutorProfile(true);
      setTutorError("Tutor information is not available for this listing.");
      return;
    }

    try {
      setShowTutorProfile(true);
      setTutorLoading(true);
      setTutorError(null);

      // Fetch tutor profile
      const profileData = await apiFetch(`/profiles/${tutorId}`);

      // If later you add a Reviews API, you can also fetch rating here and
      // merge it into profileData before calling setTutorProfile.
      setTutorProfile(profileData);
    } catch (err) {
      setTutorError(err.message || "Failed to load tutor profile");
      setTutorProfile(null);
    } finally {
      setTutorLoading(false);
    }
  }

  function closeTutorProfile() {
    setShowTutorProfile(false);
    setTutorProfile(null);
    setTutorError(null);
  }

  // === Render states ===

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-4 py-2 bg-[#8B2332] text-white rounded hover:bg-[#6D1A28]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Listing not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-[#8B2332] text-white rounded hover:bg-[#6D1A28]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-[#8B2332] hover:text-[#6D1A28] font-medium transition-colors"
        >
          <span className="mr-2">←</span> Back to Listings
        </button>

        {/* Success Message */}
        {bookingSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
            <h3 className="text-green-800 font-semibold flex items-center">
              <span className="mr-2">✓</span> Booking Request Sent!
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Your booking request has been submitted. The tutor will review it
              shortly.
            </p>
          </div>
        )}

        {/* Listing Details Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8B2332] to-[#6D1A28] p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              {listing.title || listing.subject}
            </h1>
            {listing.course_code && (
              <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                {listing.course_code}
              </span>
            )}
          </div>

            {/* Content */}
          <div className="p-8">
            {/* Tutor Info */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 uppercase tracking-wide">
                Tutor Information
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700 text-lg">
                  <span className="font-medium text-gray-600">Tutor:</span>{" "}
                  <span className="font-semibold">{listing.tutor_label || listing.tutor || "Not specified"}</span>
                </p>
                <div className="bg-gray-50 rounded-lg p-4 inline-block">
                  <span className="text-sm text-gray-500 block mb-1">Hourly Rate</span>
                  <span className="text-3xl font-bold text-[#8B2332]">
                    ${listing.hourly_rate}
                  </span>
                  <span className="text-gray-500 text-lg">/hour</span>
                </div>

                {/* TASK B: View Tutor Profile button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleViewTutorProfile}
                    className="inline-flex items-center px-5 py-2.5 bg-gray-100 text-sm font-semibold text-[#8B2332] rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                  >
                    View Tutor Profile
                  </button>
                </div>
              </div>
            </div>            {/* Subject & Course */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 uppercase tracking-wide">
                Course Details
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Subject</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {listing.subject}
                  </p>
                </div>
                {listing.course_code && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Course Code</p>
                    <p className="text-xl font-semibold text-gray-800">
                      {listing.course_code}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 uppercase tracking-wide">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed text-base">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Book Session Button + Form */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              {!showBookingForm ? (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full md:w-auto px-10 py-4 bg-[#8B2332] hover:bg-[#6D1A28] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Book Session
                </button>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-inner">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Book a Session
                    </h3>
                    <button
                      onClick={() => {
                        setShowBookingForm(false);
                        setBookingError(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                      ✕
                    </button>
                  </div>

                  {bookingError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{bookingError}</p>
                    </div>
                  )}

                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#8B2332] focus:border-[#8B2332] transition-shadow"
                        required
                        min={new Date(Date.now() + 60000)
                          .toISOString()
                          .slice(0, 16)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#8B2332] focus:border-[#8B2332] transition-shadow"
                        required
                        min={
                          startTime ||
                          new Date(Date.now() + 60000)
                            .toISOString()
                            .slice(0, 16)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#8B2332] focus:border-[#8B2332] transition-shadow"
                        placeholder="Any specific topics or questions you want to cover?"
                      />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-[#8B2332] hover:bg-[#6D1A28] text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {submitting
                          ? "Submitting..."
                          : "Submit Booking Request"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBookingForm(false);
                          setBookingError(null);
                        }}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === Tutor Profile Modal (TASK B) === */}
      {showTutorProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={closeTutorProfile}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Tutor Profile
            </h2>

            {tutorLoading && (
              <p className="text-gray-600">Loading tutor profile...</p>
            )}

            {tutorError && !tutorLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{tutorError}</p>
              </div>
            )}

            {tutorProfile && !tutorLoading && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {tutorProfile.firstName} {tutorProfile.lastName}
                  </p>
                </div>
                {tutorProfile.university && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">University</p>
                    <p className="text-lg font-medium text-gray-800">
                      {tutorProfile.university}
                    </p>
                  </div>
                )}
                {tutorProfile.major && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Major</p>
                    <p className="text-lg font-medium text-gray-800">
                      {tutorProfile.major}
                    </p>
                  </div>
                )}
                {tutorProfile.year && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Year</p>
                    <p className="text-lg font-medium text-gray-800">
                      {tutorProfile.year}
                    </p>
                  </div>
                )}
                {tutorProfile.bio && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Bio</p>
                    <p className="text-gray-700 leading-relaxed">{tutorProfile.bio}</p>
                  </div>
                )}

                {/* Optional rating if backend adds it later */}
                {typeof tutorProfile.avg_rating !== "undefined" && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Average Rating</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {Number(tutorProfile.avg_rating).toFixed(1)} / 5
                      {tutorProfile.review_count
                        ? ` (${tutorProfile.review_count} reviews)`
                        : ""}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;
