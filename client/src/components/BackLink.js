import React from "react";
import { Link, useLocation } from "react-router-dom";
import { usePreviousLocation } from "../contexts/PreviousLocationContext";

export default function BackLink({ className = "" }) {
  const { previous } = usePreviousLocation();
  const location = useLocation();

  // If there's no previous location, or the previous pathname equals the current one,
  // fall back to the explicit home page. This prevents linking to the same page.
  const hasUsefulPrevious =
    previous && previous.pathname && previous.pathname !== location.pathname;

  const target = hasUsefulPrevious
    ? previous.pathname + (previous.search || "")
    : "/home";

  return (
    <div className={`w-full max-w-7xl mx-auto  ${className}`}>
      <Link
        to={target}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-md hover:bg-gray-50 shadow-sm"
        title="Πίσω"
        aria-label="Πίσω"
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Πίσω</span>
      </Link>
    </div>
  );
}
