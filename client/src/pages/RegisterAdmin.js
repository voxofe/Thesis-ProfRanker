import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import InputField from "../components/InputField";

export default function RegisterAdmin() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirectLoading, setRedirectLoading] = useState(false);
  const [error, setError] = useState("");

  const { registerAdmin } = useAuth();
  const { showToast } = useToast();
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

    registerAdmin(firstName, lastName, email, password)
      .then(() => {
        showToast({
          type: "success",
          message: "Ο διαχειριστής δημιουργήθηκε με επιτυχία.",
        });
        setTimeout(() => {
          setRedirectLoading(true);
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        }, 500);
      })
      .catch(() =>
        setError(
          "Σφάλμα κατά την εγγραφή διαχειριστή. Παρακαλώ προσπαθήστε ξανά."
        )
      )
      .finally(() => setIsLoading(false));
  };

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

  if (redirectLoading) {
    return (
      <div className="flex justify-center min-h-screen min-w-screen">
        <div className="w-[1270px] px-7 py-4 flex flex-col min-h-screen">
          <div className="flex flex-1 justify-center items-center py-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-patras-buccaneer"></div>
              <p className="mt-4 text-gray-600">Φόρτωση...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-start pt-4 sm:px-6 lg:px-8 -mt-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-800">
           Εγγραφή διαχειριστή
        </h1>
      </div>

      <div className="mt-0 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div
          className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200"
        >
          <div className="text-[13px] text-red-900 font-medium pb-4">
            Εγγραφή Διαχειριστή - Αυτή η φόρμα δημιουργεί λογαριασμό
            διαχειριστή με ειδικά δικαιώματα
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

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
                {isLoading ? "Εγγραφή διαχειριστή..." : "Εγγραφή διαχειριστή"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
