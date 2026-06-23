import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";
import CustomSelect from "../components/CustomSelect";
import TooltipGray from "../components/TooltipGray";
import LoadingIndicator from "../components/LoadingIndicator";
import PageTitle from "../components/PageTitle";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [gender, setGender] = useState("select");
  const [isLoading, setIsLoading] = useState(false);
  const [redirectLoading, setRedirectLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
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
    isPasswordMatch &&
    (gender && gender !== "select");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    register(firstName, lastName, email, password, gender)
      .then(() => {
        navigate("/login", {
          state: {
            message: {
              type: "success",
              text: "Η εγγραφή ολοκληρώθηκε με επιτυχία. Για να ενεργοποιήσετε όλες τις λειτουργίες, επιβεβαιώστε το email σας από το link που λάβατε και στη συνέχεια συνδεθείτε.",
            },
          },
        });
      })
      .catch((err) => {
        const status = err?.response?.status;
        const serverError = (err?.response?.data?.error || "").toLowerCase();
        let text = "Προέκυψε απρόβλεπτο σφάλμα κατά την εγγραφή. Παρακαλώ δοκιμάστε ξανά.";

        if (!err?.response) {
          text =
            "Δεν ήταν δυνατή η επικοινωνία με τον διακομιστή. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.";
        } else if (status === 400 && serverError.includes("email already registered")) {
          text =
            "Υπάρχει ήδη λογαριασμός με αυτό το email. Χρησιμοποιήστε άλλο email ή συνδεθείτε.";
        } else if (status >= 500) {
          text =
            "Η εγγραφή δεν ολοκληρώθηκε λόγω τεχνικού προβλήματος. Παρακαλώ δοκιμάστε ξανά σε λίγο.";
        }

        setError(text);
      })
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

  if (redirectLoading) {
    return (
      <div className="flex justify-center min-h-screen min-w-screen">
        <div className="w-[1270px] px-7 py-4 flex flex-col min-h-screen">
          <div className="flex flex-1 justify-center items-center py-4">
            <LoadingIndicator />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-start pt-4 sm:px-6 lg:px-8 -mt-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <PageTitle>Εγγραφή στην εφαρμογή</PageTitle>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div
          className={`bg-white dark:bg-[var(--color-bg-card)] py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-[var(--color-border)]`}
        >
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

            <div className="-mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--color-text-secondary)]">
              <TooltipGray content="Το ονοματεπώνυμο σας θα εμφανίζεται στις αιτήσεις. Μπορείτε να το επεξεργαστείτε και μετά την εγγραφή.">
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-patras-albescentWhite text-patras-buccaneer text-xs font-semibold cursor-help"
                  aria-label="Σημείωση για το ονοματεπώνυμο"
                >
                  i
                </span>
              </TooltipGray>
              <span>Σημείωση για το ονοματεπώνυμο</span>
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

            <CustomSelect
              label="Φύλο"
              value={gender}
              onChange={setGender}
              options={[
                { value: "male", label: "Άνδρας" },
                { value: "female", label: "Γυναίκα" },
              ]}
              required
              placeholder="Επιλέξτε φύλο"
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
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                    <span>Εγγραφή</span>
                  </span>
                ) : (
                  "Εγγραφή"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleLoginClick}
              className="flex w-full justify-center rounded-md bg-white dark:bg-[var(--color-bg-card)] px-3 py-2 text-sm font-semibold text-patras-buccaneer dark:text-[var(--color-text-secondary)] border border-patras-buccaneer shadow-sm hover:bg-patras-albescentWhite dark:hover:bg-[var(--color-primary)] dark:hover:text-[var(--color-text-inverse)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patras-buccaneer"
            >
              Έχετε ήδη λογαριασμό; Σύνδεση
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-[var(--color-bg-card)] px-2 text-gray-500 dark:text-[var(--color-text-muted)]">
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
