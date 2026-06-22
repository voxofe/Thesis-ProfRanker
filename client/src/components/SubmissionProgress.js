import React from "react";
import LoadingIndicator from "./LoadingIndicator";

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
        <LoadingIndicator size="sm" showText={false} />
        <span className="ml-2 text-patras-buccaneer">
          {submitLabel}
          {hasStatus ? `: ${statusText}` : ""}
          {percentLabel}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-200">
        <div
          className="h-3 rounded-full bg-patras-buccaneer transition-all"
          style={{ width: `${Math.max(0, Math.min(100, percentValue))}%` }}
        ></div>
      </div>
    </div>
  );
}
