import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";
import PageTitle from "../components/PageTitle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const incomingMessage = location.state?.message;
    if (!incomingMessage) return;

    setMessage({
      type: incomingMessage.type || "success",
      text: incomingMessage.text || "",
    });

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const emailRegex =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)(?=[a-zA-Z0-9._%+-]{1,64}@)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  const isEmailValid = email === "a" || emailRegex.test(email);
  const isFormValid = !!email && !!password && isEmailValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsLoading(true);

    login(email, password)
      .then(() => {
        // Navigate to home page after successful login
        navigate("/");
      })
      .catch((err) => {
        const status = err?.response?.status;
        const serverError = (err?.response?.data?.error || "").toLowerCase();
        let text = "Προέκυψε σφάλμα κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά.";

        if (!err?.response) {
          text =
            "Δεν ήταν δυνατή η επικοινωνία με τον διακομιστή. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.";
        } else if (status === 401 || status === 404 || serverError.includes("invalid credentials") || serverError.includes("user not found")) {
          text =
            "Τα στοιχεία σύνδεσης δεν είναι σωστά. Ελέγξτε email και κωδικό και δοκιμάστε ξανά.";
        } else if (status >= 500) {
          text =
            "Η σύνδεση δεν ήταν δυνατή λόγω τεχνικού προβλήματος. Παρακαλώ δοκιμάστε ξανά σε λίγο.";
        }

        console.log("Login error:", err);
        setMessage({
          type: "error",
          text,
        });
      })
      .finally(() => setIsLoading(false));
  };

  const handleRegisterClick = () => navigate("/register");

  return (
    <div className="flex flex-col justify-start pt-4 sm:px-6 lg:px-8 -mt-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <PageTitle>Σύνδεση στην εφαρμογή</PageTitle>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[var(--color-bg-card)] py-8 px-4 shadow-lg dark:shadow-lg dark:shadow-gray-500/30 sm:rounded-lg sm:px-10 border border-gray-200 dark:border-[var(--color-border)]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {message.text && (
              <div
                className={`rounded-md p-4 border ${
                  message.type === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div
                  className={`text-sm ${
                    message.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            )}

            <InputField
              label="Email"
              id="email"
              name="email"
              type="text"
              autoComplete="email"
              value={email}
              onChange={setEmail}
            />

            <InputField
              label="Κωδικός πρόσβασης"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />

            <div>
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="flex w-full justify-center rounded-md bg-patras-buccaneer px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patras-buccaneer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                    <span>Σύνδεση</span>
                  </span>
                ) : (
                  "Σύνδεση"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleRegisterClick}
              className="flex w-full justify-center rounded-md bg-white dark:bg-[var(--color-bg-card)] px-3 py-2 text-sm font-semibold text-patras-buccaneer dark:text-[var(--color-text-secondary)] border border-patras-buccaneer shadow-sm hover:bg-patras-albescentWhite dark:hover:bg-[var(--color-primary)] dark:hover:text-[var(--color-text-inverse)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patras-buccaneer"
            >
              Δεν έχετε λογαριασμό; Εγγραφείτε
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-[var(--color-bg-card)] px-2 text-gray-500 dark:text-[var(--color-text-muted)]">
                  Πρόγραμμα Απόκτησης Διδακτικής Εμπειρίας
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
