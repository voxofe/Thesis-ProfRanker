import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { EMAIL_VERIFICATION_ENABLED } from "../utils/featureFlags";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export default function Settings() {
  const { showToast } = useToast();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isUnverified = EMAIL_VERIFICATION_ENABLED && currentUser?.verified === false;

  const isPasswordMatch = newPassword === confirmPassword;
  const isFormValid =
    !!currentPassword && !!newPassword && !!confirmPassword && isPasswordMatch;

  const checkPasswordMatch = () => {
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError("Οι κωδικοί πρόσβασης δεν ταιριάζουν.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUnverified) return;
    if (!isFormValid) return;
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios({
        method: "POST",
        url: `${API_BASE_URL}/api/user/change-password`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        data: { currentPassword, newPassword },
      });
      showToast({ message: "Ο κωδικός πρόσβασης άλλαξε επιτυχώς. Παρακαλώ συνδεθείτε ξανά.", type: "success" });
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 1500);
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        "Σφάλμα κατά την αλλαγή κωδικού. Παρακαλώ προσπαθήστε ξανά.";
      showToast({ message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-0">
      <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-800 dark:text-[var(--color-text-primary)] dark:!border-[var(--color-border)]">
        Αλλαγή κωδικού πρόσβασης
      </h1>

      <div className="max-w-2xl mx-auto">
        <div
          className={`bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:bg-[var(--color-bg-surface)] dark:border-[var(--color-border)] ${
            isUnverified ? "opacity-70" : ""
          }`}
        >
          {isUnverified && (
            <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)] dark:text-[var(--color-text-secondary)]">
              Η αλλαγή κωδικού είναι διαθέσιμη μόνο μετά την επιβεβαίωση του email σας.
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1 -mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <InputField
                  label="Τρέχων κωδικός πρόσβασης"
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  disabled={isUnverified}
                />

                <div className="hidden sm:block" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <InputField
                  label="Νέος κωδικός πρόσβασης"
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={setNewPassword}
                  onBlur={checkPasswordMatch}
                  disabled={isUnverified}
                />

                <InputField
                  label="Επιβεβαίωση νέου κωδικού"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  onBlur={checkPasswordMatch}
                  disabled={isUnverified}
                />

                {confirmPasswordError && (
                  <p className="col-span-2 text-xs text-red-600 dark:text-[var(--color-danger)] mt-1">
                    {confirmPasswordError}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isUnverified || isLoading || !isFormValid}
              className="flex w-full justify-center rounded-md bg-patras-buccaneer px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patras-buccaneer dark:bg-[var(--color-primary)] dark:hover:bg-[var(--color-primary-hover)] dark:text-[var(--color-primary-contrast)] dark:focus-visible:outline-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Αποθήκευση..." : "Αλλαγή κωδικού"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
