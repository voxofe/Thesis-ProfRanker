import React, { useEffect, useState } from "react";
import axios from "axios";
import HomePagePanel from "../components/HomePagePanel";
import CollapsibleNotice from "../components/CollapsibleNotice";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { EMAIL_VERIFICATION_ENABLED } from "../utils/featureFlags";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export default function HomeAdmin() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [sendingVerificationEmail, setSendingVerificationEmail] = useState(false);
  const [verificationCooldownSeconds, setVerificationCooldownSeconds] = useState(0);
  const [isVerificationNoticeOpen, setIsVerificationNoticeOpen] = useState(false);
  const isUnverified = EMAIL_VERIFICATION_ENABLED && currentUser?.verified === false;

  useEffect(() => {
    if (verificationCooldownSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setVerificationCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [verificationCooldownSeconds]);

  const sendVerificationEmail = async () => {
    if (sendingVerificationEmail || verificationCooldownSeconds > 0) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setSendingVerificationEmail(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/user/send-verification-email`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast({
        type: "success",
        message:
          response?.data?.message ||
          "Το email επιβεβαίωσης στάλθηκε επιτυχώς.",
      });
      const retryAfter = Number(response?.data?.retryAfterSeconds || 0);
      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        setVerificationCooldownSeconds(Math.ceil(retryAfter));
      }
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        "Αποτυχία αποστολής email επιβεβαίωσης.";
      showToast({ type: "error", message });
      const retryAfter = Number(error?.response?.data?.retryAfterSeconds || 0);
      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        setVerificationCooldownSeconds(Math.ceil(retryAfter));
      }
    } finally {
      setSendingVerificationEmail(false);
    }
  };

  const lockedPanelProps = isUnverified
    ? {
        buttonDisabled: true,
        to: undefined,
        colorClass: "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed",
      }
    : {};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-[var(--color-text-primary)] mb-2">
          Καλώς ήρθατε, διαχειριστή
        </h1>
        <p className="text-gray-600 dark:text-[var(--color-text-secondary)] text-[17px]">
          Έχετε πλήρη πρόσβαση στο σύστημα διαχείρισης αιτήσεων
        </p>
      </div>
      {isUnverified && (
        <CollapsibleNotice
          mainText={`Σας έχουμε ήδη στείλει email επιβεβαίωσης στη διεύθυνση που δηλώσατε κατά την εγγραφή.
Ελέγξτε τα εισερχόμενα και τον φάκελο ανεπιθύμητης αλληλογραφίας (spam). Αν δεν το λάβατε, ζητήστε νέα αποστολή.`}
          isOpen={isVerificationNoticeOpen}
          onToggle={() => setIsVerificationNoticeOpen((prev) => !prev)}
        >
          <button
            type="button"
            onClick={sendVerificationEmail}
            disabled={sendingVerificationEmail || verificationCooldownSeconds > 0}
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-patras-buccaneer px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-patras-sanguineBrown disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sendingVerificationEmail
              ? "Αποστολή..."
              : verificationCooldownSeconds > 0
                ? `Επανάληψη αποστολής σε ${verificationCooldownSeconds}s`
                : "Νέα αποστολή email επιβεβαίωσης"}
          </button>
        </CollapsibleNotice>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HomePagePanel
          title="Επιστημονικά πεδία και μαθήματα"
          description="Δείτε, επεξεργαστείτε ή δημιουργήστε νέα επιστημονικά πεδία και μαθήματα."
          buttonText="Διαχείριση πεδίων και μαθημάτων"
          to="/scientific-fields"
          {...lockedPanelProps}
        />
        <HomePagePanel
          title="Χρήστες"
          description="Δείτε όλους τους χρήστες του συστήματος ή δημιουργήστε νέο διαχειριστή"
          buttonText="Διαχείριση χρηστών"
          to="/users"
          {...lockedPanelProps}
        />
        <HomePagePanel
          title="Στατιστικά"
          description="Δείτε στατιστική ανάλυση αιτήσεων και υποψηφίων βάσει διαφόρων κριτηρίων."
          buttonText="Δείτε στατιστικά"
          to="/analytics"
          {...lockedPanelProps}
        />
        <HomePagePanel
          title="Γενική κατάταξη"
          description="Δείτε τη γενική κατάταξη όλων των αιτήσεων σε όλα τα επιστημονικά πεδία."
          buttonText="Δείτε κατάταξη"
          to="/ranking"
          {...lockedPanelProps}
          // showInfoMark={true}
          // infoPopup={rankingInfoPopup}
        />
      </div>
    </div>
  );
}
