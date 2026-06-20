import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { EMAIL_VERIFICATION_ENABLED } from "../utils/featureFlags";

const verificationRequestByToken = new Map();

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export default function VerifyEmail() {
  const { refreshUser, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get("token") || "").trim();
  }, []);

  const primaryAction = useMemo(
    () =>
      isLoggedIn
        ? { to: "/home", label: "Μετάβαση στην αρχική" }
        : { to: "/login", label: "Σύνδεση" },
    [isLoggedIn]
  );

  useEffect(() => {
    let cancelled = false;

    const runVerification = async () => {
      if (!EMAIL_VERIFICATION_ENABLED) {
        if (!cancelled) {
          setStatus("success");
          setMessage("Η επιβεβαίωση email είναι απενεργοποιημένη.");
          setLoading(false);
        }
        return;
      }

      if (!token) {
        if (!cancelled) {
          setStatus("error");
          setMessage("Λείπει το token επιβεβαίωσης.");
          setLoading(false);
        }
        return;
      }

      try {
        let request = verificationRequestByToken.get(token);
        if (!request) {
          request = axios.get(`${API_BASE_URL}/api/user/verify-email`, {
            params: { token },
          });
          verificationRequestByToken.set(token, request);
        }

        const response = await request;
        if (cancelled) return;
        setStatus("success");
        setMessage(response?.data?.message || "Η επιβεβαίωση email ολοκληρώθηκε επιτυχώς.");
        if (isLoggedIn) {
          await refreshUser();
        }
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          error?.response?.data?.error ||
            "Αποτυχία επιβεβαίωσης email. Παρακαλώ ζητήστε νέο link επιβεβαίωσης."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    runVerification();

    return () => {
      cancelled = true;
    };
  }, [token, isLoggedIn, refreshUser]);

  return (
    <div className="max-w-3xl mx-auto p-0">
        <div className="pt-0">
        <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-800">
            Επιβεβαίωση ηλεκτρονικής διεύθυνσης
        </h1>


        {loading ? (
          <p className="text-gray-600 text-center">Επεξεργασία επιβεβαίωσης...</p>
        ) : (
          <>
            <p
              className={`text-sm text-center ${
                status === "success" ? "text-green-700" : "text-red-700"
              }`}
            >
              {message}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to={primaryAction.to}
                className="inline-flex items-center justify-center rounded-md bg-patras-buccaneer px-4 py-2 text-sm font-medium text-white hover:bg-patras-sanguineBrown"
              >
                {primaryAction.label}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
