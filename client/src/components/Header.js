import React from "react";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/images/patras-university-logo.png";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";

export default function Header({ academicYear }) {
  const { currentUser, isLoggedIn, logout } = useAuth();

  const rolesInGreek = {
    admin: "Διαχειριστής",
    applicant: "Υποψήφιος",
    guest: "Επισκέπτης"
  };

  // Normalize Greek to plain uppercase (remove tonos/dialytika)
  const normalizeGreek = (s) =>
    (s ?? "")
      .toLocaleUpperCase("el-GR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")                    // remove combining marks
      .replace(/[\u0384\u0385\u1fbd\u1fbf-\u1ffe]/g, ""); // remove Greek tonos chars

  const getInitials = (firstName, lastName) => {
    const a = normalizeGreek(firstName).trim();
    const b = normalizeGreek(lastName).trim();
    const inits = `${a.charAt(0) || ""}${b.charAt(0) || ""}`;
    return inits || "NU"; // fallback
  };

  // Replace your current initials computation with:
  const initials = getInitials(currentUser?.firstName, currentUser?.lastName);

  const roleLabel = Array.isArray(currentUser?.roles)
    ? currentUser.roles.map((role) => rolesInGreek[role] || role).join(", ")
    : rolesInGreek[currentUser?.role] || currentUser?.role;

  return (
    <div className="w-full flex items-stretch gap-4">
      <header className="flex-1 rounded-xl border border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center px-6 py-3">
          {/* Left: Logo (clickable anchor so middle-click opens in new tab) */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="University of Patras logo"
              className="max-h-24 w-auto object-contain"
            />
          </Link>
          {/* Center: Title and Subtitle */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-xl lg:text-xl font-semibold text-gray-700 text-center">
              ΑΙΤΗΣΗ ΥΠΟΨΗΦΙΟΤΗΤΑΣ ΔΙΔΑΣΚΟΝΤΩΝ ΠΑΝΕΠΙΣΤΗΜΙΟΥ ΠΑΤΡΩΝ {academicYear}
            </h1>
            <p className="mt-1 text-base lg:text-[15px] text-gray-600 text-center">
              Πρόσκληση απόκτησης διδακτικής-ακαδημαϊκής εμπειρίας για νέους επιστήμονες, κατόχους διδακτορικού
            </p>
          </div>
        </div>
      </header>
      {/* Right: User Info Panel (outside header) */}
      {isLoggedIn && currentUser && (
        <div className="shrink-0 rounded-xl border border-gray-200 shadow-lg px-4 py-3 flex items-center justify-center">
          <UserMenu
            currentUser={currentUser}
            initials={initials}
            roleLabel={roleLabel}
            onLogout={logout}
          />
        </div>
      )}
    </div>
  );
}
