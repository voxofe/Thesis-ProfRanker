import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { deadlineDate } from "../constants"; // Import the deadline date constant

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isAfterDeadline = new Date() > deadlineDate;
  const isBeforeDeadline = !isAfterDeadline;

  const formatDate = (date) => {
    return date.toLocaleDateString("el-GR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const userRole = currentUser?.role || "guest";

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

        <div className="space-y-6">
          {/* <div className="bg-white/50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Διαχειριστικό Πάνελ
            </h2>
            <p className="text-patras-buccaneer mb-4">
              Μπορείτε να διαχειρίζεστε όλες τις αιτήσεις και τις βαθμολογίες.
            </p>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-patras-albescentWhite/20 border border-patras-albescentWhite rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-patras-buccaneer mb-3">
                Γενική Κατάταξη
              </h3>
              <p className="text-patras-buccaneer mb-4">
                Δείτε τη γενική κατάταξη όλων των αιτούντων σε όλα τα επιστημονικά πεδία.
              </p>
              <button
                onClick={() => navigate("/score/total")}
                className="bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors"
              >
                Δείτε Κατάταξη
              </button>
            </div>

            <div className="bg-patras-albescentWhite/20 border border-patras-albescentWhite rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-patras-buccaneer mb-3">
                Διαχείριση Διαχειριστών
              </h3>
              <p className="text-patras-buccaneer mb-4">
                Δημιουργήστε νέο λογαριασμό διαχειριστή με ειδικά δικαιώματα.
              </p>
              <button
                onClick={() => navigate("/register-admin")}
                className="bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors"
              >
                Δημιουργία Διαχειριστή
              </button>
            </div>
          </div>

          <div className="bg-white/50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Δικαιώματα Διαχειριστή
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Πρόσβαση σε όλες τις λειτουργίες πριν και μετά το deadline </li>
              <li>• Δημιουργία νέων διαχειριστών μέσω της ειδικής φόρμας</li>
              <li>• Διαχείριση βαθμολογιών και αιτήσεων</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Applicant and guest user content - shared UI
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
          {/* Application Panel */}
          <div className="bg-patras-albescentWhite/20 border border-patras-albescentWhite rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-patras-buccaneer mb-3">
              {userRole === "applicant" ? "Η Αίτησή μου" : "Υποβολή Αίτησης"}
            </h3>
            <p className="text-patras-buccaneer mb-4">
              {userRole === "applicant"
                ? "Μπορείτε να επεξεργαστείτε την αίτησή σας μέχρι τη λήξη της προθεσμίας."
                : "Συμπληρώστε και υποβάλετε την αίτησή σας για το πρόγραμμα."}
            </p>
            <div>
              {/* <p className="text-sm text-green-700 mb-2">
                <strong>Προθεσμία υποβολής αιτήσεων:</strong> {formatDate(deadlineDate)}
              </p>
              {isBeforeDeadline ? (
                <p className="text-sm text-green-700 mb-4">
                  Έχετε χρόνο μέχρι τη λήξη της προθεσμίας για να υποβάλετε την αίτησή σας.
                </p>
              ) : (
                <p className="text-sm text-yellow-700 mb-4">
                  Η προθεσμία υποβολής αιτήσεων έχει παρέλθει.
                </p>
              )} */}
              <button
                onClick={() => navigate("/form")}
                className="bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors"
              >
                {userRole === "applicant" ? "Επεξεργασία Αίτησης" : "Δημιουργία Αίτησης"}
              </button>
            </div>
          </div>

          {/* My score Panel */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 shadow-sm flex flex-col justify-between opacity-70 cursor-not-allowed">
            <h3 className="text-lg font-semibold text-gray-500 mb-3">
              Η Βαθμολογία μου
            </h3>
            <p className="text-gray-500 mb-4">
              Δείτε τη βαθμολογία σας μετά από την αξιολόγηση της επιτυχημένης αίτησής σας.
            </p>
            <div>
              <button
                disabled
                className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed opacity-80"
              >
                {userRole === "applicant" ? "Η Βαθμολογία μου" : "Δείτε Κατάταξη"}
              </button>
            </div>
          </div>
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
