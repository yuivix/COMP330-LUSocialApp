import React, { useState } from "react";

// Minimal helper — can be replaced with your shared apiFetch
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:4000";

async function apiFetch(path, { method = "GET", headers = {}, body } = {}) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

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
      // Swap this with a real call when Gabe’s endpoint is ready:
      // await apiFetch("/bookings", { method: "POST", body: payload });
      console.log("[Request] POST /bookings", payload);
      onSuccess?.("Request sent!");
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
            <span className="text-sm">Start time</span>
            <input
              type="datetime-local"
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">End time</span>
            <input
              type="datetime-local"
              value={endLocal}
              onChange={(e) => setEndLocal(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
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
              className="px-3 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? "Sending…" : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestModal;
