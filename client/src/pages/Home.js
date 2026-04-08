import React, { useMemo, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import HomePagePanel from "../components/HomePagePanel";
import { usePositions } from "../contexts/PositionsContext";

export default function Home() {
  const { currentUser } = useAuth();
  const { positions = [], loading } = usePositions();

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

  const parseDateTime = (isoDate, timeStr) => {
    if (!isoDate) return null;
    const [y, m, d] = isoDate.split("-").map(Number);
    if (!y || !m || !d) return null;
    const [hh, mm] = (timeStr || "23:59").split(":").map(Number);
    return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
  };

  // Applicant-specific: find their selected position by id (optional fallback)
  const applicantPosition = useMemo(() => {
    const pid = currentUser?.form?.positionId;
    if (!pid || loading) return null;
    return activePositions.find(p => String(p.id) === String(pid)) || null;
  }, [currentUser, loading, activePositions]);

  // Deadline taken from the applicant's own position, prefer backend value
  const applicantDeadline = useMemo(() => {
    const endFromUser = currentUser?.form?.positionEndDate;
    const endTimeFromUser = currentUser?.form?.positionEndTime;
    if (endFromUser) return parseDateTime(endFromUser, endTimeFromUser);
    if (applicantPosition?.endDate) return parseDateTime(applicantPosition.endDate, applicantPosition.endTime);
    return null;
  }, [currentUser, applicantPosition]);

  const isApplicantDeadlinePassed = useMemo(() => {
    if (!applicantDeadline) return false;
    return applicantDeadline.getTime() < Date.now();
  }, [applicantDeadline]);

  // Derive disabled state for the Application panel
  const isGuestDisabled = userRole === "guest" && activePositions.length === 0;
  const isApplicantDisabled = userRole === "applicant" && isApplicantDeadlinePassed;
  const applicationDisabled = isGuestDisabled || isApplicantDisabled;

  // Description text when the panel is disabled (and defaults otherwise)
  const applicationDescription = useMemo(() => {
    if (userRole === "guest") {
      return isGuestDisabled
        ? "Δεν υπάρχουν διαθέσιμες ανοιχτές θέσεις για αίτηση αυτή τη στιγμή."
        : "Συμπληρώστε και υποβάλετε την αίτησή σας για το πρόγραμμα.";
    }
    if (userRole === "applicant") {
      if (isApplicantDisabled && applicantDeadline) {
        return (
          <>
            <p>Η προθεσμία υποβολής για αυτή την θέση έληξε στις <b>{formatDate(applicantDeadline)}.</b></p>

          </>
        );
      }
      return (
        <>
          <p>Μπορείτε να επεξεργαστείτε και να αλλάξετε την αίτησή σας μέχρι τις <b>{formatDate(applicantDeadline)}.</b></p>
        </>
      );
    }
    return "";
  }, [userRole, isGuestDisabled, isApplicantDisabled, applicantDeadline, formatDate]);

  // Info popups
  const applicationInfoPopup =
    userRole === "applicant"
      ? (
          applicantDeadline
            ? (
                isApplicantDeadlinePassed
                  ? (
                    <>
                      <span className="block mb-1 text-patras-buccaneer font-semibold text-[15px] md:text-base">
                        Η προθεσμία υποβολής για αυτή την θέση έληξε στις:{" "}
                        <strong className="font-bold">{formatDate(applicantDeadline)}</strong>
                      </span>
                      <span className="block text-sm italic text-gray-700 mt-1">
                        Μπορείτε να δείτε την θέση σας στην γενική κατάταξη.
                      </span>
                    </>
                  )
                  : (
                    <>
                      <span>Έχετε χρόνο μέχρι τη λήξη της προθεσμίας για να επανυποβάλετε την αίτησή σας.</span>
                      <span className="block mt-2 text-patras-buccaneer font-semibold">
                        Προθεσμία επανυποβολής αίτησης: <strong>{formatDate(applicantDeadline)}</strong>
                      </span>
                    </>
                  )
              )
            : (
                !loading && activePositions.length === 0
                  ? <span>Δεν υπάρχουν διαθέσιμες θέσεις αυτή τη στιγμή</span>
                  : <span>Επιλέξτε θέση για να δείτε την προθεσμία υποβολής.</span>
              )
        )
      : (!loading && activePositions.length === 0)
        ? <span className="z-10">Δεν υπάρχουν διαθέσιμες θέσεις αυτή τη στιγμή</span>
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
          <span className="block mt-2 text-patras-buccaneer font-semibold">
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
  // Panels for applicant and guest
  if (userRole === "applicant" || userRole === "guest") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">
            Καλώς ήρθατε στο Πρόγραμμα Απόκτησης Διδακτικής Εμπειρίας
          </h1>
          <p className="text-gray-600 text-[17px]">
            Το πρόγραμμα απευθύνεται σε νέους επιστήμονες, κατόχους διδακτορικού τίτλου, που επιθυμούν να αποκτήσουν διδακτική-ακαδημαϊκή εμπειρία.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HomePagePanel
            title={
              userRole === "applicant"
                ? "Η αίτησή μου"
                : "Υποβολή αίτησης"
            }
            description={applicationDescription}
            buttonText={
              userRole === "applicant"
                ? "Επεξεργασία αίτησης"
                : "Δημιουργία αίτησης"
            }
            // Disable for guests when no active positions, or for applicants when deadline passed
            buttonAction={applicationDisabled ? undefined : undefined}
            to={applicationDisabled ? undefined : "/form"}
            buttonDisabled={applicationDisabled}
            colorClass={
              applicationDisabled
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
            // Hide the tooltip icon when disabled
            // showInfoMark={!applicationDisabled}
            // infoPopup={applicationInfoPopup}
          />

          <HomePagePanel
            title="Η βαθμολογία μου"
            description="Δείτε τη βαθμολογία σας μετά από την αξιολόγηση της αίτησής σας."
            buttonText="Η βαθμολογία μου"
            to={userRole === "applicant" ? `/applicant-score/${currentUser.id}` : undefined}
            buttonDisabled={userRole === "guest"}
            colorClass={
              userRole === "guest"
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
            // showInfoMark={true}
            // infoPopup={scoreInfoPopup}
          />

          <HomePagePanel
            title="Γενική κατάταξη"
            description="Δείτε τη γενική κατάταξη όλων των αιτούντων σε όλα τα επιστημονικά πεδία."
            buttonText="Δείτε Κατάταξη"
            to="/ranking"
            // showInfoMark={true}
            // infoPopup={rankingInfoPopup}
          />
        </div>
      </div>
    );
  }

  // Admin user content
  if (userRole === "admin") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">
            Καλώς ήρθατε, διαχειριστή
          </h1>
          <p className="text-gray-600 text-[17px]">
            Έχετε πλήρη πρόσβαση στο σύστημα διαχείρισης αιτήσεων
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HomePagePanel
            title="Θέσεις"
            description="Δείτε/επεξεργαστείτε όλες τις θέσεις ή δημιουργείστε μία νέα."
            buttonText="Διαχείριση θέσεων"
            to="/positions"
            // showInfoMark={true}
            // infoPopup={positionsPanelPopup}
          />
          <HomePagePanel
            title="Επιστημονικά πεδία"
            description="Διαχειριστείτε τα επιστημονικά πεδία, τα μαθήματα και τις πληροφορίες τους."
            buttonText="Διαχείριση πεδίων"
            to="/scientific-fields"
            // showInfoMark={true}
            // infoPopup={scientificFieldsPopup}
          />
          <HomePagePanel
            title="Γενική κατάταξη"
            description="Δείτε τη γενική κατάταξη όλων των αιτούντων σε όλα τα επιστημονικά πεδία."
            buttonText="Δείτε κατάταξη"
            to="/ranking"
            // showInfoMark={true}
            // infoPopup={rankingInfoPopup}
          />
          <HomePagePanel
            title="Διαχείριση διαχειριστών"
            description="Δημιουργήστε νέο λογαριασμό διαχειριστή με ειδικά δικαιώματα."
            buttonText="Δημιουργία διαχειριστή"
            to="/register-admin"
            // showInfoMark={true}
            // infoPopup={registerAdminPopup}
          />
        </div>
      </div>
    );
  }

  // Fallback content
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-600 mb-3">
          Καλώς ήρθατε
        </h2>
        <p className="text-gray-600">Παρακαλώ συνδεθείτε για να συνεχίσετε.</p>
      </div>
    </div>
  );
}
