import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Settings, User } from "lucide-react";

export default function UserMenu({ currentUser, initials, roleLabel, onLogout }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-4 bg-patras-albescentWhite/5 px-4 py-2 rounded-xl border border-gray-200 shadow-lg hover:bg-patras-albescentWhite/20 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-patras-buccaneer shadow">
          <span className="text-white font-bold text-lg">{initials}</span>
        </div>
        <div className="flex flex-col leading-tight items-start">
          <span className="text-patras-buccaneer font-semibold text-base">
            {currentUser.firstName}
          </span>
          <span className="text-patras-buccaneer font-semibold text-base -mt-1">
            {currentUser.lastName}
          </span>
          <span className="text-xs text-gray-500 font-medium">{roleLabel}</span>
        </div>
        <svg
          className="w-4 h-4 text-patras-buccaneer"
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
          className="absolute right-0 mt-3 w-max min-w-[12rem] max-w-xs rounded-xl border border-gray-200 bg-white shadow-xl z-50"
          role="menu"
        >
          <div className="py-2 text-left">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-patras-albescentWhite/40"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <User className="w-4 h-4 text-patras-buccaneer" aria-hidden="true" />
              <span className="font-medium">Το προφίλ μου</span>
            </Link>
            <Link
              to="/profile#profile-settings"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-patras-albescentWhite/40"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <Settings className="w-4 h-4 text-patras-buccaneer" aria-hidden="true" />
              <span className="font-medium">Ρυθμίσεις</span>
            </Link>
          </div>
          <div className="border-t" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-patras-albescentWhite/40"
            role="menuitem"
          >
            <span className="font-medium">Αποσύνδεση</span>
            <svg
              width={24}
              height={24}
              fill="none"
              viewBox="0 0 32 32"
              stroke="currentColor"
              className="text-patras-buccaneer"
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
