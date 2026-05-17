import React, { useCallback, useMemo } from "react";
import HomePagePanel from "../components/HomePagePanel";
import { useAuth } from "../contexts/AuthContext";
import { usePositions } from "../contexts/PositionsContext";

export default function HomeApplicant() {
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

  if (userRole === "applicant") {
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
            title="Υποβολή νέας αίτησης"
            description={applicationDescription}
            buttonText="Δημιουργία αίτησης"
            // Disable for applicants when no active positions
            buttonAction={applicationDisabled ? undefined : undefined}
            to={applicationDisabled ? undefined : "/form?mode=new"}
            buttonDisabled={applicationDisabled}
            colorClass={
              applicationDisabled
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
            // showInfoMark={!applicationDisabled}
            // infoPopup={applicationInfoPopup}
          />

          <HomePagePanel
            title="Ο φάκελός μου"
            description="Δείτε ή ενημερώστε τα στοιχεία σας, τα αρχεία και τις δημοσιεύσεις σας."
            buttonText="Προβολή φακέλου"
            to="/profile"
          />

          <HomePagePanel
            title="Οι αιτήσεις μου"
            description="Δείτε τις αιτήσεις σας και τις βαθμολογίες τους ή επεξεργαστείτε τις ενεργές αιτήσεις."
            buttonText="Προβολή αιτήσεων"
            to="/my-applications"
          />

          <HomePagePanel
            title="Γενική κατάταξη"
            description="Δείτε τη γενική κατάταξη όλων των αιτούντων σε όλα τα επιστημονικά πεδία."
            buttonText="Δείτε Κατάταξη"
            to="/ranking"
          />
        </div>
      </div>
    );
  }

  if (userRole === "guest") {
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
            title="Υποβολή αίτησης"
            description={applicationDescription}
            buttonText="Δημιουργία αίτησης"
            // Disable for guests when no active positions
            buttonAction={applicationDisabled ? undefined : undefined}
            to={applicationDisabled ? undefined : "/form?mode=new"}
            buttonDisabled={applicationDisabled}
            colorClass={
              applicationDisabled
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
            // showInfoMark={!applicationDisabled}
            // infoPopup={applicationInfoPopup}
          />

          <HomePagePanel
            title="Ο φάκελός μου"
            description="Δείτε ή ενημερώστε τα στοιχεία σας, τα αρχεία και τις δημοσιεύσεις σας."
            buttonText="Προβολή φακέλου"
            to="/profile"
          />

          <HomePagePanel
            title="Οι αιτήσεις μου"
            description="Δείτε τις αιτήσεις σας και τις βαθμολογίες τους ή επεξεργαστείτε τις ενεργές αιτήσεις."
            buttonText="Προβολή αιτήσεων"
            buttonDisabled={true}
            colorClass="bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
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

  return null;
}
