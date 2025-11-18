import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// API base: set VITE_API_BASE (Vite) or REACT_APP_API_BASE (CRA) in your frontend .env
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
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Small date helpers
function fmt(dtIso) {
  try {
    const d = new Date(dtIso);
    return d.toLocaleString();
  } catch {
    return dtIso;
  }
}

function StudentDashboard() {
  const navigate = useNavigate();
  
  // --- search state ---
  const [query, setQuery] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [subject, setSubject] = useState("");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState(null);
  
  // --- pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- upcoming bookings ---
  const [upcoming, setUpcoming] = useState([]);
  const [upLoading, setUpLoading] = useState(false);
  const [upErr, setUpErr] = useState(null);

  // --- request modal + banner ---
  const [activeListing, setActiveListing] = useState(null);
  const [banner, setBanner] = useState(null); // { type: 'success'|'error', text: string }

  const hasResults = useMemo(
    () => Array.isArray(listings) && listings.length > 0,
    [listings]
  );

  useEffect(() => {
    fetchListings("");
    fetchUpcomingBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchListings(q = "", page = 1) {
    setLoading(true);
    setLoadErr(null);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (q?.trim()) params.append('query', q.trim());
      if (courseCode?.trim()) params.append('courseCode', courseCode.trim());
      if (subject?.trim()) params.append('subject', subject.trim());
      params.append('page', page.toString());
      params.append('pageSize', '10');
      
      const path = `/listings${params.toString() ? '?' + params.toString() : ''}`;
      const data = await apiFetch(path);
      
      setListings(Array.isArray(data) ? data : data?.results ?? []);
      
      // Update pagination if backend provides it
      if (data?.totalPages) {
        setTotalPages(data.totalPages);
      }
      if (data?.currentPage) {
        setCurrentPage(data.currentPage);
      }
    } catch (e) {
      setLoadErr(e.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  async function fetchUpcomingBookings() {
    setUpLoading(true);
    setUpErr(null);
    try {
      const data = await apiFetch(`/bookings?role=student`);
      const arr = Array.isArray(data) ? data : data?.results ?? [];
      // Filter out cancelled bookings from the requests view
      const nonCancelledBookings = arr.filter(booking => (booking.status || "").toUpperCase() !== "CANCELLED");
      setUpcoming(nonCancelledBookings);
    } catch (e) {
      setUpErr(e.message || "Failed to load upcoming bookings");
    } finally {
      setUpLoading(false);
    }
  }

  async function handleCancelBooking(bookingId) {
    try {
      await apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PUT' });
      showBanner('success', 'Booking cancelled successfully');
      fetchUpcomingBookings(); // Refresh the list
    } catch (error) {
      showBanner('error', error.message || 'Failed to cancel booking');
    }
  }

  function onSubmitSearch(e) {
    e.preventDefault();
    setCurrentPage(1);
    fetchListings(query, 1);
  }
  
  function handlePageChange(newPage) {
    setCurrentPage(newPage);
    fetchListings(query, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  function handleClearFilters() {
    setQuery("");
    setCourseCode("");
    setSubject("");
    setCurrentPage(1);
    fetchListings("", 1);
  }
  
  function viewListingDetails(listingId) {
    navigate(`/listings/${listingId}`);
  }

  function openRequest(raw) {
    // normalize for consistent rendering
    const listing = {
      id: raw.id ?? raw.listing_id,
      title: raw.title ?? raw.name ?? "Untitled listing",
      subject: raw.subject ?? raw.topic ?? "—",
      hourly_rate: raw.hourly_rate ?? raw.rate ?? null,
      tutor_label: raw.tutor_label ?? raw.tutor ?? null,
    };
    setActiveListing(listing);
  }

  function closeRequest() {
    setActiveListing(null);
  }

  function showBanner(type, text) {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 3500);
  }

  // optimistic append helper
  function appendUpcoming(created) {
    if (!created) return;
    // shape normalization
    const b = {
      id: created.id ?? created.booking_id ?? `${Date.now()}`,
      listing_id: created.listing_id ?? created.listing?.id ?? null,
      listing_title:
        created.listing_title ??
        created.listing?.title ??
        created.title ??
        "Requested session",
      start_time: created.start_time ?? created.start ?? created.startTime,
      end_time: created.end_time ?? created.end ?? created.endTime,
      status: (created.status || "REQUESTED").toUpperCase(),
    };
    setUpcoming((prev) => [b, ...prev]);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome! How can we help?</h1>

      {/* Upcoming Bookings */}
      <section className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming Bookings</h2>
          <button
            onClick={fetchUpcomingBookings}
            disabled={upLoading}
            className="text-sm border px-3 py-1 rounded hover:bg-gray-50"
          >
            {upLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {upErr && <div className="text-red-600 mt-1">{upErr}</div>}

        {!upLoading && upcoming.length === 0 && (
          <p className="text-gray-700">It's looking empty...</p>
        )}

        {upcoming.length > 0 && (
          <div className="mt-3 grid gap-2">
            {upcoming.map((b) => (
              <div
                key={b.id}
                className="border rounded-md px-3 py-2 flex items-center justify-between"
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {b.listing_title || `Booking ${b.id}`}
                  </div>
                  <div className="text-gray-700">
                    {fmt(b.start_time)} → {fmt(b.end_time)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      (b.status || "").toUpperCase() === "ACCEPTED" || (b.status || "").toUpperCase() === "CONFIRMED"
                        ? "bg-emerald-100 text-emerald-800"
                        : (b.status || "").toUpperCase() === "REQUESTED" || (b.status || "").toUpperCase() === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : (b.status || "").toUpperCase() === "CANCELLED"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                    title={`Status: ${b.status || "—"}`}
                  >
                    {b.status || "—"}
                  </span>
                  {(b.status || "").toUpperCase() !== "CANCELLED" && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:border-red-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Search & Filter Section */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Search Listings</h2>
        <form onSubmit={onSubmitSearch} className="space-y-4">
          {/* Filter inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Code
              </label>
              <input
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., COMP330"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B2332] focus:border-[#8B2332]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Computer Science"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B2332] focus:border-[#8B2332]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                General Search
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by keyword..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B2332] focus:border-[#8B2332]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#8B2332] hover:bg-[#6D1A28] focus:ring-[#8B2332] text-white px-6 py-2 rounded disabled:opacity-50 transition-colors"
            >
              {loading ? "Searching…" : "Search"}
            </button>
            
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={loading}
              className="border border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-2 rounded disabled:opacity-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {loadErr && <div className="text-red-600 mb-2">{loadErr}</div>}

      {/* Results */}
      {!loading && !loadErr && !hasResults && (
        <div className="text-sm text-gray-600 italic">
          No listings yet. Try another keyword.
        </div>
      )}

      {hasResults && (
        <div className="grid gap-3">
          {listings.map((raw) => {
            const item = {
              id: raw.id ?? raw.listing_id,
              title: raw.title ?? raw.name ?? "Untitled listing",
              subject: raw.subject ?? raw.topic ?? "—",
              hourly_rate: raw.hourly_rate ?? raw.rate ?? null,
              tutor_label: raw.tutor_label ?? raw.tutor ?? null,
            };
            return (
              <div
                key={item.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-gray-700">
                    {item.subject}{" "}
                    {item.tutor_label ? `• Tutor: ${item.tutor_label}` : ""}
                  </div>
                  {item.hourly_rate != null && (
                    <div className="text-sm mt-1">${item.hourly_rate}/hr</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => viewListingDetails(item.id)}
                    className="border border-[#8B2332] text-[#8B2332] hover:bg-[#8B2332] hover:text-white px-4 py-2 rounded transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => openRequest(item)}
                    className="bg-[#8B2332] hover:bg-[#6D1A28] text-white px-4 py-2 rounded transition-colors"
                  >
                    Quick Request
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Pagination */}
      {hasResults && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Success/Error banner */}
      {banner && (
        <div
          role="status"
          className={`mt-4 rounded-md px-3 py-2 border ${banner.type === "success"
              ? "bg-green-50 border-green-200 text-green-900"
              : "bg-red-50 border-red-200 text-red-900"
            }`}
        >
          {banner.text}
        </div>
      )}

      {/* Request Modal */}
      {activeListing && (
        <RequestModal
          listing={activeListing}
          onClose={closeRequest}
          onSuccess={(msg, created) => {
            // optimistic update if API returned the created booking
            if (created) appendUpcoming(created);
            else fetchUpcomingBookings(); // fallback refetch
            showBanner("success", msg || "Request sent!");
            closeRequest();
          }}
          onError={(msg) => {
            showBanner("error", msg || "Could not create request.");
          }}
        />
      )}
    </div>
  );
}

export default StudentDashboard;

/* ---------- inline modal (kept in same file for simplicity) ---------- */
function RequestModal({ listing, onClose, onSuccess, onError }) {
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  function parseLocal(dt) {
    if (!dt) return null;
    const d = new Date(dt);
    return isNaN(d.getTime()) ? null : d;
  }

  function validate() {
    const now = new Date();
    const s = parseLocal(startLocal);
    const e = parseLocal(endLocal);
    if (!s || !e) return "Please provide both start and end times.";
    if (e <= s) return "End time must be AFTER start time.";
    if (s <= new Date(now.getTime() + 60 * 1000))
      return "Start must be in the future.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    const payload = {
      listing_id: listing.id,
      start_time: new Date(startLocal).toISOString(),
      end_time: new Date(endLocal).toISOString(),
      note: note?.trim() || undefined,
    };

    try {
      setSubmitting(true);

      // ✅ Real API call (adjust path if your backend is different)
      // Expect (ideally) to receive created booking JSON back
      const created = await apiFetch("/bookings", {
        method: "POST",
        body: payload,
      });

      onSuccess?.("Request sent!", created);
    } catch (e2) {
      if (e2?.status === 409) onError?.("Tutor not available for that time.");
      else onError?.("Could not create request.");
      setErr(e2?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/40 grid place-items-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-5 w-[min(520px,92vw)] shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold m-0">Send Request</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mt-2 text-sm text-gray-700">
          <div>
            <strong>Listing:</strong> {listing.title}
          </div>
          <div className="text-xs text-gray-500">
            ID: <code>{listing.id}</code>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 mt-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-gray-700">Start time</span>
            <input
              type="datetime-local"
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              required
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
            />
            <p className="mt-1 text-xs text-gray-500">Select a future start time</p>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-gray-700">End time</span>
            <input
              type="datetime-local"
              value={endLocal}
              onChange={(e) => setEndLocal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              required
              min={startLocal || new Date(Date.now() + 60000).toISOString().slice(0, 16)}
            />
            <p className="mt-1 text-xs text-gray-500">Select when the session should end</p>
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Note (optional)</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Anything the tutor should know?"
            />
          </label>

          {err && <div className="text-red-600">{err}</div>}

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-2 rounded text-white bg-[#8B2332] hover:bg-[#6D1A28] transition-colors"
            >
              {submitting ? "Sending…" : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
