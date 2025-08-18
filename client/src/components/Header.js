import React from "react";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/images/patras-university-logo.png";
import { useNavigate } from "react-router-dom";

export default function Header({ academicYear }) {
  const { currentUser, isLoggedIn, logout } = useAuth();
  const userInitials =
    (currentUser?.firstName?.charAt(0)?.toUpperCase() || "") +
    (currentUser?.lastName?.charAt(0)?.toUpperCase() || "");
  const navigate = useNavigate();

  const rolesInGreek = {
    admin: "Διαχειριστής",
    applicant: "Υποψήφιος",
    guest: "Επισκέπτης"
  };

  return (
    <header className="w-full rounded-xl border border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Left: Logo */}
        <button onClick={() => navigate("/")} className="flex items-center">
          <img
            src={logo}
            alt="University of Patras logo"
            className="max-h-24 w-auto object-contain"
          />
        </button>
        {/* Center: Title and Subtitle */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-xl lg:text-xl font-semibold text-gray-700 text-center">
            ΑΙΤΗΣΗ ΥΠΟΨΗΦΙΟΤΗΤΑΣ ΔΙΔΑΣΚΟΝΤΩΝ ΠΑΝΕΠΙΣΤΗΜΙΟΥ ΠΑΤΡΩΝ {academicYear}
          </h1>
          <p className="mt-1 text-base lg:text-[15px] text-gray-600 text-center">
            Πρόσκληση απόκτησης διδακτικής-ακαδημαϊκής εμπειρίας για νέους επιστήμονες, κατόχους διδακτορικού
          </p>
        </div>
        {/* Right: User Info Panel */}
        {isLoggedIn && currentUser && (
          <div className="flex items-center gap-4 bg-patras-albescentWhite/5 px-4 py-2 rounded-xl border border-gray-200 shadow-lg">
            {/* Avatar */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-patras-buccaneer shadow">
              <span className="text-white font-bold text-lg">{userInitials}</span>
            </div>
            {/* User Info */}
            <div className="flex flex-col leading-tight items-start">
              <span className="text-patras-buccaneer font-semibold text-base">
                {currentUser.firstName}
              </span>
              <span className="text-patras-buccaneer font-semibold text-base -mt-1">
                {currentUser.lastName}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {Array.isArray(currentUser.roles)
                  ? currentUser.roles.map(role => rolesInGreek[role] || role).join(", ")
                  : rolesInGreek[currentUser.role] || currentUser.role}
              </span>
            </div>
            {/* Logout Button */}
            <button
              onClick={logout}
              title="Αποσύνδεση"
              className="ml-2 p-2 rounded-full hover:bg-patras-buccaneer/10 transition-colors"
              aria-label="Logout"
            >
              <svg
                width={32}
                height={32}
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
    </header>
  );
}
