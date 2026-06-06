import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import TooltipGray from "./TooltipGray";

export default function VaultFileActions({
  file,
  onReplace,
  onDelete,
  onView,
  onDownload,
  loadingAction = null,
  actionProgress,
  showReplace = true,
  showDelete = true,
}) {
  const [open, setOpen] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [menuPosition, setMenuPosition] = useState(null);
  const [bodyPad, setBodyPad] = useState(0);
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const actionTimerRef = useRef(null);
  const isApplicationUsed = file?.isUsedInApplication ?? file?.isUsed;

  const updateMenuPosition = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const menuRect = menuRef.current?.getBoundingClientRect();
    const menuHeight = menuRect?.height || 0;
    const menuWidth = menuRect?.width || 0;
    const viewportWidth = window.innerWidth || 0;
    const viewportHeight = window.innerHeight || 0;
    const verticalOffset = 8;
    const horizontalPadding = 8;
    const top = rect.bottom + verticalOffset + window.scrollY;
    let left = rect.left;
    if (menuWidth) {
      const maxLeft = Math.max(horizontalPadding, viewportWidth - menuWidth - horizontalPadding);
      left = Math.min(Math.max(left, horizontalPadding), maxLeft);
    }
    setMenuPosition({
      top,
      left: left + window.scrollX,
    });
    if (menuHeight) {
      const menuBottom = rect.bottom + verticalOffset + menuHeight;
      const overflow = Math.max(0, menuBottom - viewportHeight);
      setBodyPad(overflow + 16);
    } else {
      setBodyPad(0);
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    updateMenuPosition();
    const handleClick = (event) => {
      const target = event.target;
      if (wrapperRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleReposition = () => {
      updateMenuPosition();
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setBodyPad(0);
      return undefined;
    }
    return () => setBodyPad(0);
  }, [open]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previous = document.body.style.paddingBottom;
    if (bodyPad > 0) {
      document.body.style.paddingBottom = `${bodyPad}px`;
    }
    return () => {
      document.body.style.paddingBottom = previous;
    };
  }, [bodyPad]);

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

  const isViewing = loadingAction === "view";
  const isDownloading = loadingAction === "download";
  const isReplacing = loadingAction === "replace";
  const isDeleting = loadingAction === "delete";
  const isBusy = isViewing || isDownloading || isReplacing || isDeleting;
  const hasExternalProgress = isReplacing && typeof actionProgress === "number";
  const displayProgress = Math.min(
    100,
    Math.max(0, hasExternalProgress ? actionProgress : localProgress)
  );
  const busyIcon = isViewing
    ? (
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    : isDownloading
      ? (
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5" />
            <path d="M12 15V3" />
          </svg>
        )
      : isReplacing
        ? (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5" />
              <path d="M21 8l-6-6" />
              <path d="M20 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
            </svg>
          )
        : isDeleting
          ? (
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M6 6l1 14h10l1-14" />
              </svg>
            )
          : null;

  useEffect(() => {
    if (!isBusy || hasExternalProgress) {
      if (actionTimerRef.current) {
        clearInterval(actionTimerRef.current);
        actionTimerRef.current = null;
      }
      if (!isBusy) {
        setLocalProgress(0);
      }
      return undefined;
    }
    setLocalProgress(0);
    const interval = isDeleting ? 140 : 350;
    actionTimerRef.current = setInterval(() => {
      setLocalProgress((prev) => {
        if (prev >= 90) return prev;
        const bump = isDeleting
          ? 10 + Math.round(Math.random() * 8)
          : 3 + Math.round(Math.random() * 4);
        return Math.min(90, prev + bump);
      });
    }, interval);
    return () => {
      if (actionTimerRef.current) {
        clearInterval(actionTimerRef.current);
        actionTimerRef.current = null;
      }
    };
  }, [isBusy, loadingAction, hasExternalProgress, isDeleting]);

  return (
    <div
      ref={wrapperRef}
      className={`pr-vault-upload-pill group relative inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-sm shadow-sm transition-colors duration-150 ${
        open ? "bg-patras-buccaneer text-white" : "bg-white hover:bg-patras-buccaneer hover:text-white"
      }`}
      style={{ overflow: "visible" }}
    >
      {isBusy && <span className="pr-vault-upload-base" aria-hidden="true" />}
      {isBusy && (
        <span
          className="pr-vault-upload-fill"
          aria-hidden="true"
          style={{ width: `${displayProgress}%` }}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative z-10 ${open ? "text-white" : "text-patras-buccaneer group-hover:text-white"}`}
        disabled={isBusy}
        aria-busy={isBusy}
      >
        <span className="inline-flex items-center gap-2">
          {isBusy && (
            <span className="inline-flex items-center">
              <span className="pr-uploading-icon" aria-hidden="true">
                {busyIcon}
              </span>
            </span>
          )}
          <span className="truncate" title={file.name}>{file.name}</span>
          {isBusy && (
            <span className="text-xs text-patras-buccaneer/70">
              {displayProgress}%
            </span>
          )}
        </span>
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
      {open &&
        typeof document !== "undefined" &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className="absolute z-[9999] w-max rounded-md border border-gray-200 bg-white shadow-lg"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button
              type="button"
              onClick={() => {
                onView();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-patras-buccaneer hover:text-white disabled:cursor-not-allowed disabled:text-gray-400"
              disabled={isBusy}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {isViewing ? "Ανοίγει..." : "Δείτε"}
            </button>
            <button
              type="button"
              onClick={() => {
                onDownload();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-patras-buccaneer hover:text-white disabled:cursor-not-allowed disabled:text-gray-400"
              disabled={isBusy}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              {isDownloading ? "Λήψη..." : "Κατεβάστε"}
            </button>
            {(showReplace || showDelete) && <div className="my-1 border-t border-gray-200" />}
            {showReplace && (
              isApplicationUsed ? (
                <div className="block w-full">
                  <TooltipGray content="Το αρχείο χρησιμοποιείται σε υποβληθείσα αίτηση.">
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
                  </TooltipGray>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={triggerReplace}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-patras-whiskey hover:text-white disabled:cursor-not-allowed disabled:text-gray-400"
                  disabled={isBusy}
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
              isApplicationUsed ? (
                <div className="block w-full">
                  <TooltipGray content="Το αρχείο χρησιμοποιείται σε υποβληθείσα αίτηση.">
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
                  </TooltipGray>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:text-gray-400"
                  disabled={isBusy}
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
          </div>,
          document.body
        )}
    </div>
  );
}
