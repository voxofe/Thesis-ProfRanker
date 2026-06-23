import React from "react";
import { createPortal } from "react-dom";
import useBodyScrollLock from "../utils/useBodyScrollLock";

export default function CourseDescriptionModal({ open, onClose, title, description }) {
  useBodyScrollLock(open);

  const renderTitle = () => {
    const baseTitle = title || "Περιγραφή μαθήματος";
    const prefix = "Περιγραφή μαθήματος:";
    if (!baseTitle.startsWith(prefix)) {
      return baseTitle;
    }

    const courseName = baseTitle.slice(prefix.length).trim();
    if (!courseName) {
      return baseTitle;
    }

    return (
      <>
        {prefix}{" "}
        <span className="text-patras-buccaneer">{courseName}</span>
      </>
    );
  };

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 w-screen h-screen dark:bg-[var(--color-bg-overlay)]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg border w-full max-w-2xl relative flex flex-col max-h-[80vh] dark:bg-[var(--color-bg-card)] dark:border-[var(--color-border)] dark:shadow-[0_20px_45px_var(--color-shadow-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4 dark:border-[var(--color-border-soft)]">
          <h2 className="text-base font-semibold text-gray-900 dark:text-[var(--color-text-primary)]">
            {renderTitle()}
          </h2>
          <button
            type="button"
            className="text-gray-600 hover:text-red-700 text-2xl leading-none dark:text-[var(--color-text-muted)] dark:hover:text-[var(--color-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-patras-buccaneer dark:focus-visible:ring-[var(--color-primary)]"
            onClick={onClose}
            title="Κλείσιμο"
            aria-label="Κλείσιμο"
          >
            &times;
          </button>
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap overflow-y-auto px-6 py-4 flex-1 min-h-0 dark:text-[var(--color-text-secondary)]">
          {description || "Δεν υπάρχει διαθέσιμη περιγραφή."}
        </div>
      </div>
    </div>,
    document.body
  );
}
