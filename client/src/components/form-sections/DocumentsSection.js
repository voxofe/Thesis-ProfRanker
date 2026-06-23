import React, { useState } from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { useAuth } from "../../contexts/AuthContext";
import Upload from "../Upload";
import Checkbox from "../Checkbox";
import TermsModal from "../TermsModal";

export default function DocumentsSection({ academicYear }) {
  const {
    formData,
    documentVault,
    handleChange,
    handleFileChange,
    handleFileDelete,
  } = useFormData();
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
            <div className="mt-4 p-4 bg-white dark:bg-[var(--color-bg-card)] rounded-md border border-blue-200 overflow-y-auto">
              <Upload
                icon="document-text"
                label="Πρωτοκολλημένη αίτηση για έκδοση σχετικής άδειας από το αρμόδιο όργανο για δημοσίους υπαλλήλους"
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
                existingOptions={documentVault?.public_employee_permission}
                onSelectExisting={(doc) =>
                  handleFileChange("publicEmployeePermissionDocument", doc)
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
            label="Είμαι πολίτης κράτους – μέλους της Ευρωπαϊκής Ένωσης (εκτός Ελλάδας)"
            id="eu-citizen-non-greek"
            name="eu-citizen-non-greek"
            checked={formData.isEuCitizenNonGreek}
            onChange={(value) => handleChange("isEuCitizenNonGreek", value)}
          />

          {formData.isEuCitizenNonGreek && (
            <div className="mt-4 p-4 bg-white dark:bg-[var(--color-bg-card)] rounded-md border border-blue-200 overflow-y-auto">
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
                existingOptions={
                  documentVault?.eu_citizen_greek_language_certificate
                }
                onSelectExisting={(doc) =>
                  handleFileChange(
                    "euCitizenGreekLanguageCertificateDocument",
                    doc
                  )
                }
                required={formData.isEuCitizenNonGreek}
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
            <div className="mt-4 p-4 bg-white dark:bg-[var(--color-bg-card)] rounded-md border border-blue-200 overflow-y-auto">
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
                existingOptions={documentVault?.not_participated_declaration}
                onSelectExisting={(doc) =>
                  handleFileChange("notParticipatedDeclarationDocument", doc)
                }
                required={formData.hasNotParticipatedInPastProgram}
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
            existingOptions={documentVault?.military}
            onSelectExisting={(doc) =>
              handleFileChange("militaryObligationsDocument", doc)
            }
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
                  className="text-patras-buccaneer underline hover:text-patras-auChico dark:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-secondary)]"
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
            existingOptions={documentVault?.responsible_declaration}
            onSelectExisting={(doc) =>
              handleFileChange("responsibleDeclarationDocument", doc)
            }
            required={true}
            compact
        />
      <TermsModal
        open={isRestrictionsModalOpen}
        onClose={() => setIsRestrictionsModalOpen(false)}
      />
    </div>
  );
}