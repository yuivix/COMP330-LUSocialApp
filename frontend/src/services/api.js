// src/api.js

// The backend base URL. Update this if your backend runs elsewhere.
const API_BASE_URL = "http://localhost:4000";

// Health check function — calls the backend /health route
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
