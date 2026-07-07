import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import HomePagePanel from "../components/HomePagePanel";
import CollapsibleNotice from "../components/CollapsibleNotice";
import { useAuth } from "../contexts/AuthContext";
import { usePositions } from "../contexts/PositionsContext";
import { useToast } from "../contexts/ToastContext";
import { useLanguage } from "../contexts";
import { EMAIL_VERIFICATION_ENABLED } from "../utils/featureFlags";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export default function HomeApplicant() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { positions = [], loading } = usePositions();
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  const [sendingVerificationEmail, setSendingVerificationEmail] = useState(false);
  const [verificationCooldownSeconds, setVerificationCooldownSeconds] = useState(0);
  const [isVerificationNoticeOpen, setIsVerificationNoticeOpen] = useState(false);

  useEffect(() => {
    if (verificationCooldownSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setVerificationCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [verificationCooldownSeconds]);

  useEffect(() => {
    const readSubmissionState = () => {
      setSubmissionInProgress(sessionStorage.getItem("submissionInProgress") === "1");
    };
    readSubmissionState();
    const intervalId = window.setInterval(readSubmissionState, 500);
    return () => window.clearInterval(intervalId);
  }, []);

  const activePositions = useMemo(() => {
    return (positions || []).filter((p) => p?.state === "active");
  }, [positions]);

  // Memoize the formatter and the function
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat("el-GR", { year: "numeric", month: "long", day: "numeric" }),
    []
  );
  const formatDate = useCallback((date) => (date ? dateFormatter.format(date) : ""), [dateFormatter]);

  const userRole = currentUser?.role;
  const isUnverified = EMAIL_VERIFICATION_ENABLED && currentUser?.verified === false;

  const appliedPositionIds = useMemo(() => {
    const applications = currentUser?.applications || [];
    return applications
      .map((app) => app?.positionId)
      .filter((posId) => posId !== null && posId !== undefined && posId !== "");
  }, [currentUser]);

  const availablePositionsForApplicant = useMemo(() => {
    if (userRole !== "applicant") return activePositions;
    const appliedSet = new Set(appliedPositionIds || []);
    return activePositions.filter((p) => !appliedSet.has(p?.id));
  }, [userRole, activePositions, appliedPositionIds]);

  const noActivePositions = !loading && activePositions.length === 0;
  const noNewPositionsForApplicant =
    userRole === "applicant" &&
    !loading &&
    activePositions.length > 0 &&
    availablePositionsForApplicant.length === 0;

  // Derive disabled state for the Application panel
  const applicationDisabled =
    (userRole === "guest" || userRole === "applicant") &&
    !loading &&
    (submissionInProgress ||
      activePositions.length === 0 ||
      (userRole === "applicant" && availablePositionsForApplicant.length === 0));

  const isPanelLocked = isUnverified;

  const sendVerificationEmail = async () => {
    if (sendingVerificationEmail || verificationCooldownSeconds > 0) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setSendingVerificationEmail(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/user/send-verification-email`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  const verificationNotice = isUnverified ? (
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
  ) : null;

  // Description text when the panel is disabled (and defaults otherwise)
  const applicationDescription = useMemo(() => {
    if (isUnverified) {
      if (userRole === "guest") {
        return t("homeApplicant.submitPrompt");
      }
      if (userRole === "applicant") {
        return t("homeApplicant.newApplicationPrompt");
      }
    }

    if (submissionInProgress) {
      return t("homeApplicant.submissionInProgress");
    }
    if (userRole === "guest") {
      return applicationDisabled
        ? t("homeApplicant.noOpenPositions")
        : t("homeApplicant.submitPrompt");
    }
    if (userRole === "applicant") {
      return applicationDisabled
        ? noNewPositionsForApplicant
          ? t("homeApplicant.appliedAll")
          : t("homeApplicant.noOpenPositions")
        : t("homeApplicant.newApplicationPrompt");
    }
    return "";
  }, [isUnverified, submissionInProgress, userRole, applicationDisabled, noNewPositionsForApplicant, t]);

  // Info popups
  const applicationInfoPopup =
    noActivePositions
      ? <span className="z-10">Δεν υπάρχουν διαθέσιμες θέσεις αυτή τη στιγμή</span>
      : noNewPositionsForApplicant
        ? <span className="z-10">Έχετε ήδη υποβάλει αίτηση σε όλες τις διαθέσιμες θέσεις</span>
        : <span>Κάντε αίτηση για το επιστημονικό πεδίο που σας αφορά</span>;

  const scoreInfoPopup = (
    <>
      <span>Δείτε αναλυτικά τα μόρια σας σε όλα τα σχετικά κριτήρια.</span>
    </>
  );

  const rankingInfoPopup = (
    <>
      <span>
        Δείτε τα μόρια και τις επιδόσεις όλων των υποψηφίων
      </span>
      {userRole === "applicant" ? (
        <>
          <span> και παρακολουθήστε τη θέση σας στην κατάταξη.</span>
          <span className="block mt-2 text-patras-buccaneer dark:text-[var(--color-text-muted)] font-semibold">
            *Η βαθμολογία σας θα εμφανιστεί <b>μετά</b> το πέρας της προθεσμίας των αιτήσεων για τη θέση που ενδιαφέρεστε.
          </span>
        </>
      ) : (
        <span></span>
      )}
    </>
  );

  const registerAdminPopup = (
    <>
      <span className="pb-2">
        Δικαιώματα Διαχειριστή
      </span>
      <ul className=" space-y-1">
        <li>• Πρόσβαση σε όλες τις λειτουργίες πριν και μετά τις προθεσμίες </li>
        <li>• Δημιουργία νέων διαχειριστών μέσω της ειδικής φόρμας</li>
        <li>• Διαχείριση βαθμολογιών και αιτήσεων</li>
      </ul>
    </>
  );
  const scientificFieldsPopup = (
    <>
      <span className="pb-2">Διαχείριση Επιστημονικών Πεδίων</span>
      <ul className="space-y-1">
        <li>• Προβολή όλων των επιστημονικών πεδίων</li>
        <li>• Δημιουργία νέων πεδίων</li>
        <li>• Επεξεργασία στοιχείων και μαθημάτων</li>
      </ul>
    </>
  );
  const positionsPanelPopup = (
    <>
      <span className="pb-2">Διαχείριση Θέσεων/επιστημονικών πεδίων</span>
      <ul className="space-y-1">
        <li>• Δείτε όλες τις θέσεις </li>
        <li>• Επεξεργαστείτε τις προσεχείς θέσεις</li>
        <li>• Δημιουργείτε μια νέα θέση</li>
      </ul>
    </>
  );

  if (userRole === "applicant") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-700 dark:text-[var(--color-text-primary)] mb-2">
            {t("homeApplicant.welcome")}
          </h1>
          <p className="text-gray-600 dark:text-[var(--color-text-secondary)] text-[17px]">
            {t("homeApplicant.subtitle")}
          </p>
        </div>
        {verificationNotice}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HomePagePanel
            title={t("homeApplicant.submitNewTitle")}
            description={applicationDescription}
            buttonText={t("homeApplicant.createApplication")}
            // Disable for applicants when no active positions
            buttonAction={applicationDisabled ? undefined : undefined}
            to={applicationDisabled || isPanelLocked ? undefined : "/form?mode=new"}
            buttonDisabled={applicationDisabled || isPanelLocked}
            colorClass={
              applicationDisabled || isPanelLocked
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
            // showInfoMark={!applicationDisabled}
            // infoPopup={applicationInfoPopup}
          />

          <HomePagePanel
            title={t("homeApplicant.myFolderTitle")}
            description={t("homeApplicant.myFolderDesc")}
            buttonText={t("homeApplicant.viewFolder")}
            to={isPanelLocked ? undefined : "/profile"}
            buttonDisabled={isPanelLocked}
            colorClass={
              isPanelLocked
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
          />

          <HomePagePanel
            title={t("homeApplicant.myApplicationsTitle")}
            description={t("homeApplicant.myApplicationsDesc")}
            buttonText={t("homeApplicant.viewApplications")}
            to={isPanelLocked ? undefined : "/my-applications"}
            buttonDisabled={isPanelLocked}
            colorClass={
              isPanelLocked
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
          />

          <HomePagePanel
            title={t("homeAdmin.rankingTitle")}
            description={t("homeAdmin.rankingDesc")}
            buttonText={t("homeAdmin.rankingButton")}
            to={isPanelLocked ? undefined : "/ranking"}
            buttonDisabled={isPanelLocked}
            colorClass={
              isPanelLocked
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
          />
        </div>
      </div>
    );
  }

  if (userRole === "guest") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-700 dark:text-[var(--color-text-primary)] mb-2">
            {t("homeApplicant.welcome")}
          </h1>
          <p className="text-gray-600 dark:text-[var(--color-text-secondary)] text-[17px]">
            {t("homeApplicant.subtitle")}
          </p>
        </div>
        {verificationNotice}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HomePagePanel
            title={t("homeApplicant.submitTitle")}
            description={applicationDescription}
            buttonText={t("homeApplicant.createApplication")}
            // Disable for guests when no active positions
            buttonAction={applicationDisabled ? undefined : undefined}
            to={applicationDisabled || isPanelLocked ? undefined : "/form?mode=new"}
            buttonDisabled={applicationDisabled || isPanelLocked}
            colorClass={
              applicationDisabled || isPanelLocked
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
            // showInfoMark={!applicationDisabled}
            // infoPopup={applicationInfoPopup}
          />

          <HomePagePanel
            title={t("homeApplicant.myFolderTitle")}
            description={t("homeApplicant.myFolderDesc")}
            buttonText={t("homeApplicant.viewFolder")}
            to={isPanelLocked ? undefined : "/profile"}
            buttonDisabled={isPanelLocked}
            colorClass={
              isPanelLocked
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
          />

          <HomePagePanel
            title={t("homeApplicant.myApplicationsTitle")}
            description={t("homeApplicant.myApplicationsDesc")}
            buttonText={t("homeApplicant.viewApplications")}
            buttonDisabled={true || isPanelLocked}
            colorClass="bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
            // showInfoMark={true}
            // infoPopup={scoreInfoPopup}
          />

          <HomePagePanel
            title={t("homeAdmin.rankingTitle")}
            description={t("homeAdmin.rankingDesc")}
            buttonText={t("homeAdmin.rankingButton")}
            to={isPanelLocked ? undefined : "/ranking"}
            buttonDisabled={isPanelLocked}
            colorClass={
              isPanelLocked
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
            // showInfoMark={true}
            // infoPopup={rankingInfoPopup}
          />
        </div>
      </div>
    );
  }

  return null;
}
