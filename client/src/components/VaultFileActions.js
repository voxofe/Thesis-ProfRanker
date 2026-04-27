import React, { useEffect, useRef, useState } from "react";
import Tooltip from "./Tooltip.jsx";

export default function VaultFileActions({
  file,
  onReplace,
  onDelete,
  onView,
  onDownload,
  showReplace = true,
  showDelete = true,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const triggerReplace = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleReplaceChange = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (selected) {
      onReplace(selected);
      setOpen(false);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`group relative inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs shadow-sm transition-colors duration-150 ${
        open ? "bg-patras-buccaneer text-white" : "bg-white hover:bg-patras-buccaneer hover:text-white"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={open ? "text-white" : "text-patras-buccaneer group-hover:text-white"}
      >
        {file.name}
      </button>
      {showReplace && (
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.odt"
          onChange={handleReplaceChange}
        />
      )}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-max rounded-md border border-gray-200 bg-white shadow-lg z-20">
          <button
            type="button"
            onClick={() => {
              onView();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-patras-buccaneer hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Δείτε
          </button>
          <button
            type="button"
            onClick={() => {
              onDownload();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-patras-buccaneer hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
            Κατεβάστε
          </button>
          {(showReplace || showDelete) && <div className="my-1 border-t border-gray-200" />}
          {showReplace && (
            file.isUsed ? (
              <div className="block w-full">
                <Tooltip content="Το αρχείο χρησιμοποιείται σε υποβληθείσα αίτηση.">
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 3h5v5" />
                      <path d="M21 8l-6-6" />
                      <path d="M20 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
                    </svg>
                    Αντικατάσταση
                  </button>
                </Tooltip>
              </div>
            ) : (
              <button
                type="button"
                onClick={triggerReplace}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-patras-whiskey hover:text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 3h5v5" />
                  <path d="M21 8l-6-6" />
                  <path d="M20 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
                </svg>
                Αντικατάσταση
              </button>
            )
          )}
          {showDelete && (
            file.isUsed ? (
              <div className="block w-full">
                <Tooltip content="Το αρχείο χρησιμοποιείται σε υποβληθείσα αίτηση.">
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M6 6l1 14h10l1-14" />
                    </svg>
                    Διαγραφή
                  </button>
                </Tooltip>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-red-700 hover:text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M6 6l1 14h10l1-14" />
                </svg>
                Διαγραφή
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
