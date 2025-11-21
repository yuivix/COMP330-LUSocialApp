import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProfileById,
  getTutorReviewsSummary,
} from "../../services/profile.service";

const h = React.createElement;

export default function TutorProfilePage() {
  const { userId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [rating, setRating] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfileById(userId);
        setTutor(profile);
      } catch (e) {
        console.error("Failed to load tutor profile:", e);
      }

      try {
        const r = await getTutorReviewsSummary(userId);
        setRating(r);
      } catch (e2) {
        console.warn("No rating available:", e2);
      }
    })();
  }, [userId]);

  if (!tutor) {
    return h("div", { className: "p-4" }, "Loading tutor profile…");
  }

  return h(
    "div",
    { className: "p-4 max-w-xl mx-auto" },
    h("h1", { className: "text-2xl mb-2" }, tutor.name || "Tutor"),
    h("p", {}, tutor.university || "—"),
    h(
      "p",
      { className: "mt-2" },
      tutor.bio || "This tutor hasn’t added a bio yet."
    ),
    rating
      ? h(
          "p",
          { className: "mt-2 text-sm" },
          `⭐ ${Number(rating.average).toFixed(1)} (${rating.count} reviews)`
        )
      : h("p", { className: "mt-2 text-sm text-gray-500" }, "No rating yet")
  );
}
