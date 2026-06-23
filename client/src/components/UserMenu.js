import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";

export default function UserMenu({ currentUser, initials, roleLabel, onLogout }) {
  const [open, setOpen] = useState(false);
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const wrapperRef = useRef(null);
  const fullNameRef = useRef(null);
  const fullName = `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (!open || !fullNameRef.current) {
      setShowNameTooltip(false);
      return;
    }
    const el = fullNameRef.current;
    setShowNameTooltip(el.scrollWidth > el.clientWidth);
  }, [open, fullName]);

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="group inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/90 px-2 py-1 shadow-sm hover:bg-patras-albescentWhite/40 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)] dark:hover:bg-[var(--color-primary)] dark:hover:border-[var(--color-primary)]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="px-1 text-lg font-bold text-patras-buccaneer dark:text-[var(--color-text-primary)] dark:group-hover:text-[var(--color-text-inverse)]">{initials}</span>
        <svg
          className={`w-4 h-4 text-patras-buccaneer dark:text-[var(--color-text-secondary)] dark:group-hover:text-[var(--color-text-inverse)] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-3 w-max min-w-[11rem] max-w-64 rounded-xl border border-gray-300 bg-white shadow-xl z-50 overflow-hidden dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/90 text-right dark:border-[var(--color-border)] dark:bg-[var(--color-bg-muted)]">
            <div className="group relative">
              <div
                ref={fullNameRef}
                className="text-sm font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)] truncate"
                title={showNameTooltip ? (fullName || "Χρήστης") : undefined}
              >
                {fullName || "Χρήστης"}
              </div>
              {showNameTooltip && (
                <div className="pointer-events-none absolute right-0 top-full z-10 mt-1 hidden max-w-64 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 shadow-md group-hover:block dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)] dark:text-[var(--color-text-secondary)]">
                  {fullName || "Χρήστης"}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 dark:text-[var(--color-text-muted)]">{roleLabel}</div>
          </div>

          <Link
            to="/change-password"
            className="w-full flex items-center justify-end gap-2 px-4 py-3 text-sm text-gray-700 text-right hover:bg-patras-albescentWhite/40 dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-primary)] dark:hover:text-[var(--color-text-inverse)]"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <KeyRound className="w-4 h-4 text-patras-buccaneer dark:text-[var(--color-text-secondary)]" aria-hidden="true" />
            <span className="font-medium">Αλλαγή κωδικού</span>
          </Link>
          <div className="border-t dark:border-[var(--color-border)]" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full flex items-center justify-end gap-2 px-4 py-3 text-sm text-gray-700 text-right hover:bg-patras-albescentWhite/40 dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-primary)] dark:hover:text-[var(--color-text-inverse)]"
            role="menuitem"
          >
            <span className="font-medium">Αποσύνδεση</span>
            <svg
              width={24}
              height={24}
              fill="none"
              viewBox="0 0 32 32"
              stroke="currentColor"
              className="text-patras-buccaneer dark:text-[var(--color-text-secondary)]"
            >
              <path d="m25.853 13.146-2-2a.5.5 0 0 0-.708.708L24.293 13H15.5a.5.5 0 0 0 0 1h8.793l-1.147 1.146a.5.5 0 0 0 .708.708l2-2a.5.5 0 0 0-.001-.708z" />
              <path d="M20 15v6h-6v1h6.5a.5.5 0 0 0 .5-.5V15z" />
              <path d="M21 12V5.5a.5.5 0 0 0-.5-.5h-14a.509.509 0 0 0-.5.5v16a.5.5 0 0 0 .18.384l6 5A.5.5 0 0 0 13 26.5v-16a.5.5 0 0 0-.18-.384L7.881 6H20v6zm-9 13.433-5-4.167V6.567l5 4.167z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
