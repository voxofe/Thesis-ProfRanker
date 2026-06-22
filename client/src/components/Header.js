import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/images/ProfRanker-logo.png";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";
import { Moon, Sun } from "lucide-react";

export default function Header({ academicYear }) {
  const { currentUser, isLoggedIn, logout } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState("EL");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const rolesInGreek = {
    admin: "Διαχειριστής",
    applicant: {
      male: "Υποψήφιος",
      female: "Υποψήφια",
    },
    guest: {
      male: "Επισκέπτης",
      female: "Επισκέπτρια",
    },
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

  const resolveRoleLabel = (role, gender) => {
    const label = rolesInGreek[role];
    if (!label) return role;
    if (typeof label === "string") return label;
    if (gender === "female") return label.female || label.male || role;
    return label.male || role;
  };

  const roleLabel = Array.isArray(currentUser?.roles)
    ? currentUser.roles
        .map((role) => resolveRoleLabel(role, currentUser?.gender))
        .join(", ")
    : resolveRoleLabel(currentUser?.role, currentUser?.gender);

  return (
    <header className="w-full rounded-xl border border-gray-200 shadow-lg bg-patras-albescentWhite/15">
      <div className="w-full flex flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:gap-5">
        <Link to="/" className="shrink-0 flex items-center justify-start">
          <img
            src={logo}
            alt="ProfRanker logo"
            className="max-h-24 w-auto object-contain"
          />
        </Link>

        <div className="flex-1 flex flex-col items-start justify-center text-left md:px-2">
          <h1 className="text-xl lg:text-xl font-semibold text-gray-700">
            ΑΙΤΗΣΗ ΥΠΟΨΗΦΙΟΤΗΤΑΣ ΔΙΔΑΣΚΟΝΤΩΝ ΠΑΝΕΠΙΣΤΗΜΙΟΥ ΠΑΤΡΩΝ {academicYear}
          </h1>
          <p className="mt-1 text-base lg:text-[15px] text-gray-600">
            Πρόσκληση απόκτησης διδακτικής-ακαδημαϊκής εμπειρίας για νέους επιστήμονες, κατόχους διδακτορικού
          </p>
        </div>

        <div className="flex items-center justify-start gap-3 md:justify-end">
          <div className="inline-flex rounded-md border border-gray-300 overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setSelectedLanguage("EN")}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide ${
                selectedLanguage === "EN"
                  ? "bg-patras-buccaneer text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage("EL")}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide ${
                selectedLanguage === "EL"
                  ? "bg-patras-buccaneer text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              ΕΛ
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-patras-buccaneer hover:bg-patras-albescentWhite/40"
            aria-label={isDarkMode ? "Αλλάξτε σε φωτεινή λειτουργία" : "Αλλάξτε σε σκοτεινή λειτουργία"}
            title={isDarkMode ? "Αλλάξτε σε φωτεινή λειτουργία" : "Αλλάξτε σε σκοτεινή λειτουργία"}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isLoggedIn && currentUser && (
            <>
              <span className="hidden lg:block h-12 border-l border-gray-300" aria-hidden="true" />
              <UserMenu
                currentUser={currentUser}
                initials={initials}
                roleLabel={roleLabel}
                onLogout={logout}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
