// frontend/src/services/api.js

// Base URL for your backend API.
// For local dev your backend is on http://localhost:4000.
// In production you can set REACT_APP_API_URL to the Render URL.
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

/**
 * Generic API fetch wrapper.
 * Adds JSON headers + Authorization token automatically.
 */
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }
    throw new Error(errorData.error || "Request failed");
  }

  // 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

/**
 * Backend health check – used on the login screen
 */
export function checkHealth() {
  return apiFetch("/health");
}
