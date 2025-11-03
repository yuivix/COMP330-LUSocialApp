import React, { useEffect, useState } from "react";

// API base URL
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Shared fetch helper that auto-attaches the token
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
    const err = new Error(data?.message || data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Date formatter
function fmt(dtIso) {
  try {
    const d = new Date(dtIso);
    return d.toLocaleString();
  } catch {
    return dtIso;
  }
}

const TutorDashboard = () => {
  // Pending requests state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listings state
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState(null);

  // Banner for success/error messages
  const [banner, setBanner] = useState(null); // { type: 'success'|'error', text: string }

  useEffect(() => {
    fetchRequests();
    fetchListings();
  }, []);

  // Fetch pending booking requests for the tutor
  async function fetchRequests() {
    setLoading(true);
    setError(null);
    try {
      // Fetch bookings where role=tutor and status=PENDING (uppercase to match database)
      const data = await apiFetch("/bookings?role=tutor&status=PENDING");
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  // Fetch tutor's own listings
  async function fetchListings() {
    setListingsLoading(true);
    setListingsError(null);
    try {
      // Fetch all listings (we'll filter by tutor_id if needed, or use a specific endpoint)
      const data = await apiFetch("/listings");
      // Since we're logged in as the tutor, we should filter listings by the current user
      // For now, we'll display all listings - in production, you'd want to filter by tutor_id
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setListingsError(err.message || "Failed to load listings");
    } finally {
      setListingsLoading(false);
    }
  }

  // Accept a booking request
  async function handleAccept(bookingId) {
    try {
      // Optimistically update the UI
      setRequests((prev) =>
        prev.map((req) =>
          req.id === bookingId || req.booking_id === bookingId
            ? { ...req, status: "confirmed" }
            : req
        )
      );

      // Call the backend
      await apiFetch(`/bookings/${bookingId}/accept`, {
        method: "PUT",
      });

      // Show success message
      showBanner("success", "Booking accepted successfully!");

      // Remove from pending list after a short delay
      setTimeout(() => {
        setRequests((prev) =>
          prev.filter(
            (req) => req.id !== bookingId && req.booking_id !== bookingId
          )
        );
      }, 1000);
    } catch (err) {
      console.error("Error accepting booking:", err);
      showBanner("error", err.message || "Failed to accept booking");

      // Revert optimistic update on error
      fetchRequests();
    }
  }

  function showBanner(type, text) {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 3500);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome! What are you looking for today?
      </h1>

      {/* Success/Error Banner */}
      {banner && (
        <div
          role="status"
          className={`mb-4 rounded-md px-3 py-2 border ${banner.type === "success"
              ? "bg-green-50 border-green-200 text-green-900"
              : "bg-red-50 border-red-200 text-red-900"
            }`}
        >
          {banner.text}
        </div>
      )}

      {/* Pending Booking Requests Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Pending Booking Requests</h2>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="text-sm border px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-gray-600 flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
            Loading requests...
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && requests.length === 0 && (
          <p className="text-gray-700">No pending requests.</p>
        )}

        {/* Requests Table */}
        {!loading && requests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listing
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => {
                  const bookingId = req.id || req.booking_id;
                  const studentName =
                    req.student_first_name && req.student_last_name
                      ? `${req.student_first_name} ${req.student_last_name}`
                      : req.student_email || `Student ${req.student_id}`;
                  const listingTitle = req.listing_title || `Listing ${req.listing_id}`;
                  const status = (req.status || "pending").toUpperCase();

                  // Map database status to user-friendly labels
                  const statusLabel = status === "CONFIRMED" ? "ACCEPTED" : status === "PENDING" ? "REQUESTED" : status;

                  return (
                    <tr key={bookingId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">
                          {studentName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {req.student_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">
                          {listingTitle}
                        </div>
                        {req.subject && (
                          <div className="text-gray-500 text-xs">
                            {req.subject}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>{fmt(req.start_time)}</div>
                        <div className="text-xs text-gray-500">
                          to {fmt(req.end_time)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status === "CONFIRMED"
                              ? "bg-green-100 text-green-800"
                              : status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {status === "PENDING" && (
                          <button
                            onClick={() => handleAccept(bookingId)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        {status === "CONFIRMED" && (
                          <button
                            disabled
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium cursor-not-allowed opacity-90"
                          >
                            ✓ Accepted
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* My Listings Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">My Listings</h2>
          <button
            onClick={fetchListings}
            disabled={listingsLoading}
            className="text-sm border px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {listingsLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Error State */}
        {listingsError && (
          <div className="text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
            {listingsError}
          </div>
        )}

        {/* Loading State */}
        {listingsLoading && (
          <div className="text-gray-600 flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
            Loading listings...
          </div>
        )}

        {/* Empty State */}
        {!listingsLoading && !listingsError && listings.length === 0 && (
          <p className="text-gray-700">No listings yet.</p>
        )}

        {/* Listings Grid */}
        {!listingsLoading && listings.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.listing_id || listing.id}
                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2">
                  {listing.title || listing.subject || "Untitled"}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Subject:</span> {listing.subject || "N/A"}
                  </p>
                  {listing.course_code && (
                    <p>
                      <span className="font-medium">Course:</span> {listing.course_code}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Rate:</span> ${listing.hourly_rate}/hr
                  </p>
                  {listing.description && (
                    <p className="text-gray-500 mt-2 line-clamp-2">
                      {listing.description}
                    </p>
                  )}
                </div>
                <div className="mt-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${listing.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {listing.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TutorDashboard;