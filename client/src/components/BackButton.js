import React from "react";
import { useNavigate } from "react-router-dom";
import { usePreviousLocation } from "../contexts/PreviousLocationContext";

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();
  const { previous } = usePreviousLocation();

  const handleBack = () => {
    if (previous && previous.pathname) {
      // Navigate to the stored previous location (preserves search)
      navigate(previous.pathname + (previous.search || ""));
    } else {
      // Fallback to history back
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      title="Πίσω"
      aria-label="Back"
      className={`inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors ${className}`}
    >
      <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.5 15L6.5 10L11.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
