import React from "react";

const typeStyles = {
  success: "border-green-300 bg-green-50 text-green-800",
  error: "border-red-300 bg-red-50 text-red-800",
  info: "border-blue-300 bg-blue-50 text-blue-800",
  warning: "border-amber-300 bg-amber-50 text-amber-800",
};

export default function Toast({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-6 right-6 z-50 space-y-3"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
            typeStyles[toast.type] || typeStyles.info
          }`}
        >
          <div className="text-sm font-medium leading-5 flex-1">
            {toast.message}
          </div>
          <button
            type="button"
            onClick={() => onClose(toast.id)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-current/70 hover:bg-black/5 hover:text-current"
            aria-label="Κλείσιμο ειδοποίησης"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 6l8 8M14 6l-8 8" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
