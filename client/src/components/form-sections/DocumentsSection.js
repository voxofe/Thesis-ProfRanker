import React, { useState } from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { useAuth } from "../../contexts/AuthContext";
import Upload from "../Upload";
import Checkbox from "../Checkbox";

export default function DocumentsSection({ academicYear }) {
  const { formData, handleChange, handleFileChange, handleFileDelete } =
    useFormData();
  const { currentUser } = useAuth();
  const [isRestrictionsModalOpen, setIsRestrictionsModalOpen] = useState(false);

  const requiresMilitaryDoc = currentUser?.gender === "male";

  return (
    <div className="space-y-6">
              
      <div className="bg-patras-goldSand/20 p-3 rounded-lg">
        <div className="space-y-4">
          <Checkbox
            label="Είμαι δημόσιος υπάλληλος"
            id="is-public-employee"
            name="is-public-employee"
            checked={formData.isPublicEmployee}
            onChange={(value) => handleChange("isPublicEmployee", value)}
          />

          {formData.isPublicEmployee && (
            <div className="mt-4 p-4 bg-white rounded-md border border-blue-200 overflow-y-auto">
              <Upload
                icon="document-text"
                label="Πρωτοκολλημένη αίτηση για έκδοση σχετικής άδειας από το αρμόδιο όργανο"
                contentLabel="την πρωτοκολλημένη αίτηση"
                contentStatus="η αίτηση"
                id="public-employee-permission-upload"
                name="public-employee-permission-upload"
                accept=".pdf,.doc,.docx,.odt"
                uploadedFile={formData.publicEmployeePermissionDocument}
                onChange={(e) =>
                  handleFileChange("publicEmployeePermissionDocument", e)
                }
                onDelete={() =>
                  handleFileDelete("publicEmployeePermissionDocument")
                }
                required={formData.isPublicEmployee}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-patras-goldSand/20 p-3 rounded-lg">
        <div className="space-y-4">
          <Checkbox
            label="Δεν έχω επιλεγεί σε άλλο πρόγραμμα Απόκτησης Ακαδημαϊκής Διδακτικής Εμπειρίας, στο πλαίσιο των προηγούμενων προσκλήσεων ΕΔΒΜ 20 (ακαδ. έτος 2016‐2017), ΕΔΒΜ 45 (ακαδ. έτος 2017‐2018), ΕΔΒΜ 82 (ακαδ. έτος 2018‐2019), καθώς και της ΕΔΒΜ 96 (ακαδ. έτη 2019‐2020 και 2020‐2021) του ΕΠ ΑΝΑΔ ΕΔΒΜ 2014‐2020."
            id="not-participated"
            name="not-participated"
            checked={formData.hasNotParticipatedInPastProgram}
            onChange={(value) =>
              handleChange("hasNotParticipatedInPastProgram", value)
            }
          />

          {formData.hasNotParticipatedInPastProgram && (
            <div className="mt-4 p-4 bg-white rounded-md border border-blue-200 overflow-y-auto">
              <Upload
                icon="document-text"
                label="Υπεύθυνη δήλωση μη προηγούμενης συμμετοχής"
                contentLabel="την υπεύθυνη δήλωση"
                contentStatus="η υπεύθυνη δήλωση"
                id="not-participated-declaration-upload"
                name="not-participated-declaration-upload"
                accept=".pdf,.doc,.docx,.odt"
                uploadedFile={formData.notParticipatedDeclarationDocument}
                onChange={(e) =>
                  handleFileChange("notParticipatedDeclarationDocument", e)
                }
                onDelete={() =>
                  handleFileDelete("notParticipatedDeclarationDocument")
                }
                required={formData.hasNotParticipatedInPastProgram}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-patras-goldSand/20 p-3 rounded-lg">
        <div className="space-y-4">
          <Checkbox
            label="Είμαι πολίτης κράτους – μέλους της Ευρωπαϊκής Ένωσης (εκτός Ελλάδας)"
            id="eu-citizen-non-greek"
            name="eu-citizen-non-greek"
            checked={formData.isEuCitizenNonGreek}
            onChange={(value) => handleChange("isEuCitizenNonGreek", value)}
          />

          {formData.isEuCitizenNonGreek && (
            <div className="mt-4 p-4 bg-white rounded-md border border-blue-200 overflow-y-auto">
              <Upload
                icon="document-text"
                label="Πιστοποιητικό ελληνομάθειας Δ΄ επιπέδου από το Κέντρο Ελληνικής Γλώσσας"
                contentLabel="το πιστοποιητικό"
                contentStatus="το πιστοποιητικό"
                id="eu-citizen-greek-language-certificate-upload"
                name="eu-citizen-greek-language-certificate-upload"
                accept=".pdf,.doc,.docx,.odt"
                uploadedFile={
                  formData.euCitizenGreekLanguageCertificateDocument
                }
                onChange={(e) =>
                  handleFileChange(
                    "euCitizenGreekLanguageCertificateDocument",
                    e
                  )
                }
                onDelete={() =>
                  handleFileDelete("euCitizenGreekLanguageCertificateDocument")
                }
                required={formData.isEuCitizenNonGreek}
              />
            </div>
          )}
        </div>
      </div>

        {requiresMilitaryDoc && (
        <Upload
            icon="document-text"
            label={`Υπεύθυνη δήλωση εκπλήρωσης στρατιωτικών υποχρεώσεων ή νόμιμης απαλλαγής από αυτές ή αναβολής για το ακαδημαϊκό έτος ${academicYear}`}
            contentLabel="την υπεύθυνη δήλωση"
            contentStatus="η υπεύθυνη δήλωση"
            id="military-obligations-upload"
            name="military-obligations-upload"
            accept=".pdf,.doc,.docx,.odt"
            uploadedFile={formData.militaryObligationsDocument}
            onChange={(e) => handleFileChange("militaryObligationsDocument", e)}
            onDelete={() => handleFileDelete("militaryObligationsDocument")}
            required={true}
            compact
        />
        )}

        <Upload
            icon="document-text"
            label={
                <>
                Υπεύθυνη δήλωση σχετικά με τους{" "}
                <button
                    type="button"
                    className="text-patras-buccaneer underline hover:text-patras-auChico"
                    onClick={() => setIsRestrictionsModalOpen(true)}
                >
                    περιορισμούς της Πράξης
                </button>
                </>
            }
            contentLabel="την υπεύθυνη δήλωση"
            contentStatus="η υπεύθυνη δήλωση"
            id="responsible-declaration-upload"
            name="responsible-declaration-upload"
            accept=".pdf,.doc,.docx,.odt"
            uploadedFile={formData.responsibleDeclarationDocument}
            onChange={(e) =>
                handleFileChange("responsibleDeclarationDocument", e)
            }
            onDelete={() =>
                handleFileDelete("responsibleDeclarationDocument")
            }
            required={true}
            compact
        />
      {isRestrictionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg border w-full max-w-lg p-6 relative max-h-[80vh] overflow-hidden">
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-600 hover:text-red-700 text-2xl"
              onClick={() => setIsRestrictionsModalOpen(false)}
              title="Κλείσιμο"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Όροι Πράξης
            </h2>
            <div className="text-sm text-gray-700 space-y-4 overflow-y-auto max-h-[65vh] pr-2">
              <p>
                Υπεύθυνη Δήλωση αρ. 8, παρ. 4, του Ν.1599/1986 στην οποία
                δηλώνεται ότι ο/η υποψήφιος/α:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  έλαβε γνώση των όρων της παρούσας πρόσκλησης εκδήλωσης
                  ενδιαφέροντος και τους αποδέχεται όλους ανεπιφύλακτα.
                </li>
                <li>
                  τα στοιχεία του βιογραφικού σημειώματος είναι αληθή.
                </li>
                <li>
                  έχει λάβει το διδακτορικό του τίτλο (ημερομηνία επιτυχούς
                  υποστήριξης) μετά την 1.1.2011.
                </li>
                <li>
                  δεν κατέχει θέση μέλους ΔΕΠ/ΕΠ, ΕΕΠ, ΕΔΙΠ, ΕΤΕΠ των ΑΕΙ, ή
                  συμβασιούχου Επιστημονικού Συνεργάτη ΤΕΙ, ή συμβασιούχου
                  Εργαστηριακού Συνεργάτη ΤΕΙ στην Ελλάδα ή στην αλλοδαπή.
                </li>
                <li>
                  δεν κατέχει θέση διοικητικού προσωπικού στο Ίδρυμα.
                </li>
                <li>
                  δεν κατέχει θέση Ερευνητή / Ειδικού Λειτουργικού
                  Επιστήμονα σε ερευνητικά κέντρα της Ελλάδας ή της αλλοδαπής.
                </li>
                <li>
                  κατά τη διάρκεια του ακαδημαϊκού έτους 2021-2022 δεν θα
                  κατέχει θέση συμβασιούχου διδάσκοντα του Π.Δ. 407/80 στην
                  Ελλάδα, ή θέση συμβασιούχου πανεπιστημιακού υποτρόφου του
                  έκτου εδαφίου της παρ. 6 του άρθρου 29 του ν. 4009/2011, όπως
                  έχει τροποποιηθεί και ισχύει, του οικείου τμήματος πέραν της
                  σύμβασης που θα συνάψει στο πλαίσιο της παρούσας Δράσης.
                </li>
                <li>
                  κατά τη διάρκεια του ακαδημαϊκού έτους 2021-2022 μπορεί να
                  διδάξει μαθήματα σε μόνο ένα (1) Τμήμα, ενός (1) Ανώτατου
                  Εκπαιδευτικού Ιδρύματος.
                </li>
                <li>
                  δίνει τη συγκατάθεσή του, σε περίπτωση επιλογής του, για
                  την αποστολή των στοιχείων του (ονοματεπώνυμο και τα στοιχεία
                  επικοινωνίας) στο Εθνικό Κέντρο Τεκμηρίωσης (επίσημος φορέας
                  Ελληνικού Στατιστικού Συστήματος), προκειμένου να
                  επικοινωνήσουν για τη διεξαγωγή διαδικασίας αξιολόγησης του
                  έργου της εν λόγω Πράξης.
                </li>
                <li>
                    γνωρίζει και αποδέχεται εγγράφως, ότι με την υποβολή
                    υποψηφιότητας παραχωρεί το δικαίωμα χρήσης των προσωπικών
                    δεδομένων για τους σκοπούς της αξιολόγησης όπως και την κατά
                    Νόμο αναγκαία χρήση τους για λόγους διαφάνειας στην ανάρτηση των
                    σχετικών αποφάσεων στην ιστοσελίδα της Αναθέτουσας Αρχής και
                    σύμφωνα με τις κείμενες διατάξεις, στο σύστημα ΔΙΑΥΓΕΙΑ.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}