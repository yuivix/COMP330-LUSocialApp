// frontend/src/services/profile.service.js
import { apiFetch } from "./api";

export async function getMyProfile() {
  return apiFetch("/profiles/me");
}

export async function updateMyProfile(payload) {
  return apiFetch("/profiles/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getProfileById(userId) {
  return apiFetch(`/profiles/${userId}`);
}

// Optional – if your backend has a reviews summary endpoint
export async function getTutorReviewsSummary(userId) {
  try {
    return await apiFetch(`/reviews/summary?userId=${userId}`);
  } catch {
    return null;
  }
}
