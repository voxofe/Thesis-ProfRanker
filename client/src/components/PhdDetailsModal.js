import React from "react";
import { createPortal } from "react-dom";
import useBodyScrollLock from "../utils/useBodyScrollLock";

export default function PhdDetailsModal({ open, onClose, title, abstract, keywords }) {
  useBodyScrollLock(open);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const safeTitle = (title || "").trim();
  const safeAbstract = (abstract || "").trim();
  const safeKeywords = Array.isArray(keywords)
    ? keywords.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 dark:bg-[var(--color-bg-overlay)]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg border w-full max-w-2xl relative flex flex-col max-h-[80vh] dark:bg-[var(--color-bg-card)] dark:border-[var(--color-border)] dark:shadow-[0_20px_45px_var(--color-shadow-strong)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4 dark:border-[var(--color-border-soft)]">
          <div>
            <h2 className="text-base/6 font-semibold text-gray-900 dark:text-[var(--color-text-primary)]">Διδακτορική διατριβή:</h2>
            <p className="text-base text-gray-600 dark:text-[var(--color-text-secondary)]">{safeTitle || "—"}</p>
          </div>
          <button
            type="button"
            className="text-gray-600 hover:text-red-700 text-2xl leading-none dark:text-[var(--color-text-muted)] dark:hover:text-[var(--color-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-patras-buccaneer dark:focus-visible:ring-[var(--color-primary)]"
            onClick={onClose}
            title="Κλείσιμο"
          >
            &times;
          </button>
        </div>
        <div className="text-sm text-gray-700 space-y-6 overflow-y-auto px-6 py-4 flex-1 min-h-0 dark:text-[var(--color-text-secondary)]">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2 dark:text-[var(--color-text-primary)]">Περίληψη</h3>
            <p className="whitespace-pre-wrap text-gray-700 dark:text-[var(--color-text-secondary)]">
              {safeAbstract || "—"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2 dark:text-[var(--color-text-primary)]">Λέξεις-κλειδιά</h3>
            {safeKeywords.length ? (
              <div className="flex flex-wrap gap-2">
                {safeKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center rounded-full bg-patras-goldSand/30 px-3 py-1 text-sm text-gray-800 dark:bg-[var(--color-bg-muted)] dark:text-[var(--color-text-primary)]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-[var(--color-text-muted)]">—</p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
