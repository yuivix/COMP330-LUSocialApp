// frontend/src/services/api.js

// Local backend for development.
// You can override this with REACT_APP_API_URL in .env if needed.
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

/**
 * Backend fetch helper
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (e) { }

  if (!response.ok) {
    const error = new Error(data?.error || "Request failed");
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export async function checkHealth() {
  return apiFetch("/health");
}
