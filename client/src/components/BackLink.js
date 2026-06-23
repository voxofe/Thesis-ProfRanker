import React from "react";
import { Link } from "react-router-dom";

export default function BackLink({ className = "", to, onClick }) {
  const target = to || "/home";

  return (
    <div className={`w-full ${className}`}>
      <Link
        to={target}
        onClick={onClick}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-md hover:bg-gray-50 shadow-sm dark:text-[var(--color-text-secondary)] dark:bg-[var(--color-bg-card)] dark:border-[var(--color-border)] dark:hover:bg-[var(--color-bg-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patras-buccaneer dark:focus-visible:outline-[var(--color-primary)]"
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
