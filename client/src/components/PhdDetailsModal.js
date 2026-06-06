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
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg border w-full max-w-2xl relative flex flex-col max-h-[80vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base/6 font-semibold text-gray-900">Διδακτορική διατριβή:</h2>
            <p className="text-base text-gray-600">{safeTitle || "—"}</p>
          </div>
          <button
            type="button"
            className="text-gray-600 hover:text-red-700 text-2xl leading-none"
            onClick={onClose}
            title="Κλείσιμο"
          >
            &times;
          </button>
        </div>
        <div className="text-sm text-gray-700 space-y-6 overflow-y-auto px-6 py-4 flex-1 min-h-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Περίληψη</h3>
            <p className="whitespace-pre-wrap text-gray-700">
              {safeAbstract || "—"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Λέξεις-κλειδιά</h3>
            {safeKeywords.length ? (
              <div className="flex flex-wrap gap-2">
                {safeKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center rounded-full bg-patras-goldSand/30 px-3 py-1 text-sm text-gray-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">—</p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
