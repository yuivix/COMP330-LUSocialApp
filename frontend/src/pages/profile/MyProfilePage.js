import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function getCurrentUserId() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    // Try a few likely field names
    return user.userId || user.user_id || user.id || null;
  } catch {
    return null;
  }
}

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

  // Treat 404 as "no profile yet" for GET requests
  if (res.status === 404 && method === "GET") {
    return null;
  }

  if (!res.ok) {
    const err = new Error(
      data?.message || data?.error || `Request failed (${res.status})`
    );
    err.status = res.status;
    throw err;
  }

  return data;
}

export default function MyProfilePage() {
  const [form, setForm] = useState({
    name: "",
    university: "",
    major: "",
    year: "",
    avatarUrl: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    const userId = getCurrentUserId();
    if (!userId) {
      setError("Missing user id from localStorage.");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch(`/profiles/${userId}`);
      console.log("Loaded profile:", data); // optional

      if (data) {
        const fullName =
          data.name ||
          (data.firstName && data.lastName
            ? `${data.firstName} ${data.lastName}`
            : data.firstName || data.lastName || "");

        setForm({
          name: fullName || "",
          university: data.university || "",
          major: data.major || "",
          year: data.year || "",
          avatarUrl: data.avatarUrl || "",
          bio: data.bio || "",
        });
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Split the name into first + last
      const trimmed = (form.name || "").trim();
      const [firstName, ...rest] = trimmed.split(" ");
      const lastName = rest.join(" ") || null;

      const payload = {
        firstName: firstName || null,
        lastName,
        university: form.university || null,
        major: form.major || null,
        year: form.year || null,
        avatarUrl: form.avatarUrl || null,
        bio: form.bio || null,
      };

      await apiFetch("/profiles/me", {
        method: "PATCH",
        body: payload,
      });

      setEditing(false);
    } catch (e) {
      console.error("Failed to save profile:", e);
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8">Loading profile…</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {editing ? "Edit Profile" : "My Profile"}
      </h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!editing ? (
        <>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Name:</strong> {form.name || "—"}
            </p>
            <p>
              <strong>University:</strong> {form.university || "—"}
            </p>
            <p>
              <strong>Major:</strong> {form.major || "—"}
            </p>
            <p>
              <strong>Year:</strong> {form.year || "—"}
            </p>
            <p>
              <strong>Bio:</strong> {form.bio || "—"}
            </p>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Edit Profile
          </button>
        </>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          {["name", "university", "major", "year", "avatarUrl"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {field}
              </label>
              <input
                type="text"
                value={form[field] || ""}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={form.bio || ""}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full border rounded px-2 py-1 text-sm min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 border rounded"
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
