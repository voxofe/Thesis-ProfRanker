import React, { useEffect, useState } from "react";
import axios from "axios";
import HomePagePanel from "../components/HomePagePanel";
import CollapsibleNotice from "../components/CollapsibleNotice";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useLanguage } from "../contexts";
import { EMAIL_VERIFICATION_ENABLED } from "../utils/featureFlags";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export default function HomeAdmin() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
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
          t("homeAdmin.verificationSent"),
      });
      const retryAfter = Number(response?.data?.retryAfterSeconds || 0);
      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        setVerificationCooldownSeconds(Math.ceil(retryAfter));
      }
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        t("homeAdmin.verificationFailed");
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
          {t("homeAdmin.welcome")}
        </h1>
        <p className="text-gray-600 dark:text-[var(--color-text-secondary)] text-[17px]">
          {t("homeAdmin.subtitle")}
        </p>
      </div>
      {isUnverified && (
        <CollapsibleNotice
          mainText={t("homeAdmin.verificationNotice")}
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
              ? t("homeAdmin.sending")
              : verificationCooldownSeconds > 0
                ? t("homeAdmin.resendIn", { seconds: verificationCooldownSeconds })
                : t("homeAdmin.resend")}
          </button>
        </CollapsibleNotice>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HomePagePanel
          title={t("homeAdmin.fieldsTitle")}
          description={t("homeAdmin.fieldsDesc")}
          buttonText={t("homeAdmin.fieldsButton")}
          to="/scientific-fields"
          {...lockedPanelProps}
        />
        <HomePagePanel
          title={t("homeAdmin.usersTitle")}
          description={t("homeAdmin.usersDesc")}
          buttonText={t("homeAdmin.usersButton")}
          to="/users"
          {...lockedPanelProps}
        />
        <HomePagePanel
          title={t("homeAdmin.statsTitle")}
          description={t("homeAdmin.statsDesc")}
          buttonText={t("homeAdmin.statsButton")}
          to="/analytics"
          {...lockedPanelProps}
        />
        <HomePagePanel
          title={t("homeAdmin.rankingTitle")}
          description={t("homeAdmin.rankingDesc")}
          buttonText={t("homeAdmin.rankingButton")}
          to="/ranking"
          {...lockedPanelProps}
          // showInfoMark={true}
          // infoPopup={rankingInfoPopup}
        />
      </div>
    </div>
  );
}
