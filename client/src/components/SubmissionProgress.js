import React from "react";

export default function SubmissionProgress({
  loading,
  submitLabel,
  statusText,
  percent,
}) {
  if (!loading) return null;
  const percentValue = typeof percent === "number" ? percent : 0;
  const percentLabel = ` ${Math.round(percentValue)}%`;
  const hasStatus = Boolean(statusText);

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center">
        <svg
          className="animate-spin h-6 w-6 text-patras-buccaneer"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        <span className="ml-2 text-patras-buccaneer">
          {submitLabel}
          {hasStatus ? `: ${statusText}` : ""}
          {percentLabel}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-[var(--color-bg-muted)]">
        <div
          className="h-3 rounded-full bg-patras-buccaneer transition-all"
          style={{ width: `${Math.max(0, Math.min(100, percentValue))}%` }}
        ></div>
      </div>
    </div>
  );
}
