import React from "react";
import { RefreshCw } from "lucide-react";
import LoadingIndicator from "./LoadingIndicator";

export default function RefreshButton({
  onClick,
  loading = false,
  disabled = false,
  label = "Ανανέωση",
  className = "",
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={label}
      title={label}
      className={`flex items-center gap-2 px-3 py-1 rounded-full bg-patras-buccaneer text-white font-medium text-sm shadow-sm hover:bg-patras-sanguineBrown transition border border-patras-buccaneer disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <LoadingIndicator size="sm" showText={false} className="leading-none" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      <span>{label}</span>
    </button>
  );
}
