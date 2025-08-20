import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { deadlineDate } from "../constants";
import HomePagePanel from "../components/HomePagePanel";

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isAfterDeadline = new Date() > deadlineDate;
  const isBeforeDeadline = !isAfterDeadline;
  const formatDate = (date) =>
    date.toLocaleDateString("el-GR", { year: "numeric", month: "long", day: "numeric" });
  const userRole = currentUser?.role;

  // Info popups
  const applicationInfoPopup = (
    <>
      <span>
        {isBeforeDeadline
          ? "Έχετε χρόνο μέχρι τη λήξη της προθεσμίας για να επανυποβάλετε την αίτησή σας."
          : "Η προθεσμία υποβολής αιτήσεων έχει παρέλθει."}
      </span>
      <span className="mt-3 font-semibold">
        <strong>Προθεσμία υποβολής αίτησης:</strong> {formatDate(deadlineDate)}
      </span>
    </>
  );

  const scoreInfoPopup = (
    <>
      <span>Δείτε αναλυτικά τα μόρια σας μετά την ολοκλήρωση της αξιολόγησης.</span>
    </>
  );

  const rankingInfoPopup = (
    <>
      <span>
        Δείτε τα μόρια και τις επιδόσεις όλων των υποψηφίων
        
      </span>{
      userRole === "applicant" ? (
        <span>και παρακολουθήστε τη θέση σας στην κατάταξη.</span>
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
        <li>• Πρόσβαση σε όλες τις λειτουργίες πριν και μετά το deadline </li>
        <li>• Δημιουργία νέων διαχειριστών μέσω της ειδικής φόρμας</li>
        <li>• Διαχείριση βαθμολογιών και αιτήσεων</li>
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
                ? "Η Αίτησή μου"
                : "Υποβολή Αίτησης"
            }
            description={
              userRole === "applicant"
                ? "Μπορείτε να επεξεργαστείτε και να αλλάξετε την αίτησή σας."
                : "Συμπληρώστε και υποβάλετε την αίτησή σας για το πρόγραμμα."
            }
            buttonText={
              userRole === "applicant"
                ? "Επεξεργασία Αίτησης"
                : "Δημιουργία Αίτησης"
            }
            buttonAction={() => navigate("/form")}
            showInfoMark={true}
            infoPopup={applicationInfoPopup}
          />

          <HomePagePanel
            title="Η Βαθμολογία μου"
            description="Δείτε τη βαθμολογία σας μετά από την αξιολόγηση της επιτυχημένης αίτησής σας."
            buttonText="Η Βαθμολογία μου"
            buttonAction={
              userRole === "applicant"
                ? () => navigate(`/score/applicant/${currentUser.id}`)
                : undefined
            }
            buttonDisabled={userRole === "guest"}
            colorClass={
              userRole === "guest"
                ? "bg-gray-100 border border-gray-300 opacity-70 cursor-not-allowed"
                : "bg-patras-albescentWhite/20 border border-patras-albescentWhite"
            }
            showInfoMark={true}
            infoPopup={scoreInfoPopup}
          />

          <HomePagePanel
            title="Γενική Κατάταξη"
            description="Δείτε τη γενική κατάταξη όλων των αιτούντων σε όλα τα επιστημονικά πεδία."
            buttonText="Δείτε Κατάταξη"
            buttonAction={() => navigate("/score/total")}
            showInfoMark={true}
            infoPopup={rankingInfoPopup}
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
            Καλώς ήρθατε, Διαχειριστή
          </h1>
          <p className="text-gray-600 text-[17px]">
            Έχετε πλήρη πρόσβαση στο σύστημα διαχείρισης αιτήσεων
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HomePagePanel
            title="Γενική Κατάταξη"
            description="Δείτε τη γενική κατάταξη όλων των αιτούντων σε όλα τα επιστημονικά πεδία."
            buttonText="Δείτε Κατάταξη"
            buttonAction={() => navigate("/score/total")}
            showInfoMark={true}
            infoPopup={rankingInfoPopup}
          />
          <HomePagePanel
            title="Διαχείριση Διαχειριστών"
            description="Δημιουργήστε νέο λογαριασμό διαχειριστή με ειδικά δικαιώματα."
            buttonText="Δημιουργία Διαχειριστή"
            buttonAction={() => navigate("/register-admin")}
            showInfoMark={true}
            infoPopup={registerAdminPopup}
            
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
