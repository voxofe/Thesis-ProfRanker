import React from "react";
import { createPortal } from "react-dom";
import useBodyScrollLock from "../utils/useBodyScrollLock";

export default function CourseDescriptionModal({ open, onClose, title, description }) {
  useBodyScrollLock(open);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 w-screen h-screen"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg border w-full max-w-2xl relative flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {title || "Περιγραφή μαθήματος"}
          </h2>
          <button
            type="button"
            className="text-gray-600 hover:text-red-700 text-2xl leading-none"
            onClick={onClose}
            title="Κλείσιμο"
            aria-label="Κλείσιμο"
          >
            &times;
          </button>
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap overflow-y-auto px-6 py-4 flex-1 min-h-0">
          {description || "Δεν υπάρχει διαθέσιμη περιγραφή."}
        </div>
      </div>
    </div>,
    document.body
  );
}
