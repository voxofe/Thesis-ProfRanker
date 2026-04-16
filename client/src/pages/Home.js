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

  // Derive disabled state for the Application panel
  const applicationDisabled =
    (userRole === "guest" || userRole === "applicant") &&
    !loading &&
    activePositions.length === 0;

  // Description text when the panel is disabled (and defaults otherwise)
  const applicationDescription = useMemo(() => {
    if (userRole === "guest") {
      return applicationDisabled
        ? "Δεν υπάρχουν διαθέσιμες ανοιχτές θέσεις για αίτηση αυτή τη στιγμή."
        : "Συμπληρώστε και υποβάλετε την αίτησή σας για το πρόγραμμα.";
    }
    if (userRole === "applicant") {
      return applicationDisabled
        ? "Δεν υπάρχουν διαθέσιμες ανοιχτές θέσεις για αίτηση αυτή τη στιγμή."
        : "Μπορείτε να υποβάλετε νέα αίτηση για οποιαδήποτε ενεργή θέση.";
    }
    return "";
  }, [userRole, applicationDisabled]);

  // Info popups
  const applicationInfoPopup =
    !loading && activePositions.length === 0
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
                ? "Υποβολή νέας αίτησης"
                : "Υποβολή αίτησης"
            }
            description={applicationDescription}
            buttonText={
              userRole === "applicant"
                ? "Δημιουργία αίτησης"
                : "Δημιουργία αίτησης"
            }
            // Disable for guests when no active positions, or for applicants when deadline passed
            buttonAction={applicationDisabled ? undefined : undefined}
            to={applicationDisabled ? undefined : "/form?mode=new"}
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
            title="Οι αιτήσεις μου & οι βαθμολογίες μου"
            description="Δείτε τις υποβληθείσες αιτήσεις σας, τα δικαιολογητικά και τις βαθμολογίες σας."
            buttonText="Προβολή αιτήσεων"
            to={userRole === "applicant" ? "/my-applications" : undefined}
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
