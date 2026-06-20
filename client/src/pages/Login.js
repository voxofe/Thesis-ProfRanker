import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";

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
        console.log("Login error:", err);
        setMessage({
          type: "error",
          text: "Σφάλμα κατά τη σύνδεση. Παρακαλώ ελέγξτε τα στοιχεία σας.",
        });
      })
      .finally(() => setIsLoading(false));
  };

  const handleRegisterClick = () => navigate("/register");

  return (
    <div className="flex flex-col justify-start pt-4 sm:px-6 lg:px-8 -mt-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-gray-600">
          Σύνδεση στην εφαρμογή
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Εισάγετε τα στοιχεία σας για πρόσβαση
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
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
                {isLoading ? "Σύνδεση..." : "Σύνδεση"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleRegisterClick}
              className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-patras-buccaneer border border-patras-buccaneer shadow-sm hover:bg-patras-albescentWhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patras-buccaneer"
            >
              Δεν έχετε λογαριασμό; Εγγραφείτε
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
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
