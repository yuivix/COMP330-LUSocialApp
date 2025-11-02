import React from "react";

function ListingCard({ listing, onRequest }) {
  const { id, title, subject, hourly_rate, tutor_label } = listing;

  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-700">
          {subject} {tutor_label ? `• Tutor: ${tutor_label}` : ""}
        </div>
        {hourly_rate != null && (
          <div className="text-sm mt-1">${hourly_rate}/hr</div>
        )}
        <div className="text-xs text-gray-500 mt-1">
          listing_id: <code>{id}</code>
        </div>
      </div>
      <button
        onClick={() => onRequest(listing)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded"
      >
        Request
      </button>
    </div>
  );
}

export default ListingCard;
