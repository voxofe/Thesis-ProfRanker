import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts";
import logo from "../assets/images/ProfRanker-logo.png";
import { Link, useLocation } from "react-router-dom";
import UserMenu from "./UserMenu";
import { Moon, Sun } from "lucide-react";

export default function Header({ academicYear }) {
  const { currentUser, isLoggedIn, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState("EL");

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

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isPublicLanding = location.pathname === "/";
  const showAuthButtons = !isLoggedIn && (isAuthPage || isPublicLanding);
  const showUserSlot = (isLoggedIn && currentUser) || showAuthButtons;

  return (
    <header className="w-full rounded-xl border border-gray-200 shadow-lg bg-patras-albescentWhite/15 dark:border-transparent dark:shadow-lg dark:shadow-gray-500/30 dark:bg-[var(--color-bg-surface)]">
      <div className="w-full flex flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:gap-5">
        <Link to="/" className="shrink-0 flex items-center justify-start">
          <img
            src={logo}
            alt="ProfRanker logo"
            className="max-h-24 w-auto object-contain"
          />
        </Link>

        <div className="flex-1 flex flex-col items-start justify-center text-left md:px-2">
          <h1 className="text-xl lg:text-xl font-semibold text-gray-700 dark:text-[var(--color-text-primary)]">
            ΑΙΤΗΣΗ ΥΠΟΨΗΦΙΟΤΗΤΑΣ ΔΙΔΑΣΚΟΝΤΩΝ ΠΑΝΕΠΙΣΤΗΜΙΟΥ ΠΑΤΡΩΝ {academicYear}
          </h1>
          <p className="mt-1 text-base lg:text-[15px] text-gray-600 dark:text-[var(--color-text-secondary)]">
            Πρόσκληση απόκτησης διδακτικής-ακαδημαϊκής εμπειρίας για νέους επιστήμονες, κατόχους διδακτορικού
          </p>
        </div>

        <div className="flex items-center justify-start gap-4 md:justify-end md:gap-5">
          <div className="inline-flex rounded-md border border-gray-300 overflow-hidden bg-white dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
            <button
              type="button"
              onClick={() => setSelectedLanguage("EN")}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide ${
                selectedLanguage === "EN"
                  ? "bg-patras-buccaneer text-white dark:bg-[var(--color-primary)] dark:text-[var(--color-primary-contrast)]"
                  : "text-gray-600 hover:bg-gray-50 dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-muted)]"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage("EL")}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide ${
                selectedLanguage === "EL"
                  ? "bg-patras-buccaneer text-white dark:bg-[var(--color-primary)] dark:text-[var(--color-primary-contrast)]"
                  : "text-gray-600 hover:bg-gray-50 dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-muted)]"
              }`}
            >
              ΕΛ
            </button>
          </div>

          <div className="ml-1 md:ml-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-patras-buccaneer hover:bg-patras-albescentWhite/40 dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-muted)]"
              aria-label={isDarkMode ? "Αλλάξτε σε φωτεινή λειτουργία" : "Αλλάξτε σε σκοτεινή λειτουργία"}
              title={isDarkMode ? "Αλλάξτε σε φωτεινή λειτουργία" : "Αλλάξτε σε σκοτεινή λειτουργία"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          {showUserSlot && (
            <>
              <span className="hidden lg:block ml-1 md:ml-2 h-12 border-l border-gray-300 dark:border-[var(--color-border)]" aria-hidden="true" />
              {isLoggedIn && currentUser ? (
                <UserMenu
                  currentUser={currentUser}
                  initials={initials}
                  roleLabel={roleLabel}
                  onLogout={logout}
                />
              ) : (
                <div className="flex flex-col gap-2 min-w-[110px]">
                  <Link
                    to="/login"
                    className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold border transition-colors ${
                      location.pathname === "/login"
                        ? "bg-patras-buccaneer text-white border-patras-buccaneer"
                        : "bg-white text-patras-buccaneer border-patras-buccaneer hover:bg-patras-albescentWhite dark:bg-[var(--color-bg-card)] dark:text-[var(--color-text-secondary)] dark:border-[var(--color-border-accent)] dark:hover:bg-[var(--color-bg-muted)]"
                    }`}
                  >
                    Σύνδεση
                  </Link>
                  <Link
                    to="/register"
                    className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold border transition-colors ${
                      location.pathname === "/register"
                        ? "bg-patras-buccaneer text-white border-patras-buccaneer"
                        : "bg-white text-patras-buccaneer border-patras-buccaneer hover:bg-patras-albescentWhite dark:bg-[var(--color-bg-card)] dark:text-[var(--color-text-secondary)] dark:border-[var(--color-border-accent)] dark:hover:bg-[var(--color-bg-muted)]"
                    }`}
                  >
                    Εγγραφή
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
