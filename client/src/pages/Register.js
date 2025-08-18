import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";

export default function Register({ isAdmin = false }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, registerAdmin } = useAuth();
  const navigate = useNavigate();

  const emailRegex =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)(?=[a-zA-Z0-9._%+-]{1,64}@)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  const isEmailValid = emailRegex.test(email);
  const isPasswordMatch = password === confirmPassword;
  const isFormValid =
    !!firstName &&
    !!lastName &&
    !!email &&
    !!password &&
    !!confirmPassword &&
    isEmailValid &&
    isPasswordMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const registrationMethod = isAdmin ? registerAdmin : register;

    registrationMethod(firstName, lastName, email, password)
      .then(() => navigate("/login"))
      .catch(() =>
        setError(
          `Σφάλμα κατά την εγγραφή ${
            isAdmin ? "διαχειριστή" : "χρήστη"
          }. Παρακαλώ προσπαθήστε ξανά.`
        )
      )
      .finally(() => setIsLoading(false));
  };

  const handleLoginClick = () => navigate("/login");

  const checkPasswordMatch = () => {
    if (password && confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError("Οι κωδικοί πρόσβασης δεν ταιριάζουν.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const checkEmailValidity = () => {
    if (!isEmailValid) {
      setEmailError("Παρακαλώ εισάγετε έγκυρο email.");
    } else {
      setEmailError("");
    }
  };

  return (
    <div className="flex flex-col justify-start pt-4 sm:px-6 lg:px-8 -mt-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-gray-600">
          {isAdmin ? "Εγγραφή Διαχειριστή" : "Εγγραφή στο σύστημα"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isAdmin
            ? "Συμπληρώστε τα στοιχεία για δημιουργία λογαριασμού διαχειριστή"
            : "Συμπληρώστε τα στοιχεία σας για δημιουργία λογαριασμού"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div
          className={`bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200`}
        >
          {isAdmin && (
            <div className="text-[13px] text-red-900 font-medium pb-4">
              Εγγραφή Διαχειριστή - Αυτή η φόρμα δημιουργεί λογαριασμό
              διαχειριστή με ειδικά δικαιώματα
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 -mb-4">
              <InputField
                label="Όνομα"
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={setFirstName}
              />

              <InputField
                label="Επώνυμο"
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={setLastName}
              />
            </div>

            <InputField
              label="Email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              onBlur={checkEmailValidity}
            />

            {/* Password and Confirm Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 -mb-4 gap-x-4">
              <InputField
                label="Κωδικός πρόσβασης"
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
                onBlur={checkPasswordMatch}
              />

              <InputField
                label="Επιβεβαίωση κωδικού πρόσβασης"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                onBlur={checkPasswordMatch}
              />

              {/* Form validation hints */}
              {emailError || confirmPasswordError ? (
                <p className={"text-xs text-red-600"}>
                  {emailError || confirmPasswordError}
                </p>
              ) : null}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="flex w-full justify-center rounded-md bg-patras-buccaneer px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patras-buccaneer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? isAdmin
                    ? "Εγγραφή Διαχειριστή..."
                    : "Εγγραφή..."
                  : isAdmin
                  ? "Εγγραφή Διαχειριστή"
                  : "Εγγραφή"}
              </button>
            </div>
          </form>

          {!isAdmin && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleLoginClick}
                className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-patras-buccaneer border border-patras-buccaneer shadow-sm hover:bg-patras-albescentWhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patras-buccaneer"
              >
                Έχεις ήδη λογαριασμό; Σύνδεση
              </button>
            </div>
          )}


          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Πρόγραμμα Απόκτησης Ακαδημαϊκής Διδακτικής Εμπειρίας
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
