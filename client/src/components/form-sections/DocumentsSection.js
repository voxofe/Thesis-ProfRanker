import React, { useState } from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts";
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
  const { t } = useLanguage();
  const [isRestrictionsModalOpen, setIsRestrictionsModalOpen] = useState(false);

  const requiresMilitaryDoc = currentUser?.gender === "male";

  return (
    <div className="space-y-6">
              
      <div className="bg-patras-goldSand/20 p-3 rounded-lg">
        <div className="space-y-4">
          <Checkbox
            label={t("documents.publicEmployee")}
            id="is-public-employee"
            name="is-public-employee"
            checked={formData.isPublicEmployee}
            onChange={(value) => handleChange("isPublicEmployee", value)}
          />

          {formData.isPublicEmployee && (
            <div className="mt-4 p-4 bg-white dark:bg-[var(--color-bg-card)] rounded-md border border-blue-200 overflow-y-auto">
              <Upload
                icon="document-text"
                label={t("documents.publicEmployeeDoc")}
                contentLabel={t("documents.applicationContentLabel")}
                contentStatus={t("documents.applicationContentStatus")}
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
            label={t("documents.euCitizen")}
            id="eu-citizen-non-greek"
            name="eu-citizen-non-greek"
            checked={formData.isEuCitizenNonGreek}
            onChange={(value) => handleChange("isEuCitizenNonGreek", value)}
          />

          {formData.isEuCitizenNonGreek && (
            <div className="mt-4 p-4 bg-white dark:bg-[var(--color-bg-card)] rounded-md border border-blue-200 overflow-y-auto">
              <Upload
                icon="document-text"
                label={t("documents.greekLanguageCert")}
                contentLabel={t("documents.certContentLabel")}
                contentStatus={t("documents.certContentStatus")}
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
            label={t("documents.notParticipated")}
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
                label={t("documents.notParticipatedDoc")}
                contentLabel={t("documents.declarationContentLabel")}
                contentStatus={t("documents.declarationContentStatus")}
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
            label={t("documents.militaryDoc", { year: academicYear })}
            contentLabel={t("documents.declarationContentLabel")}
            contentStatus={t("documents.declarationContentStatus")}
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
                {t("documents.restrictionsPrefix")}
                <button
                    type="button"
                  className="text-patras-buccaneer underline hover:text-patras-auChico dark:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-secondary)]"
                    onClick={() => setIsRestrictionsModalOpen(true)}
                >
                    {t("documents.restrictionsLink")}
                </button>
                </>
            }
            contentLabel={t("documents.declarationContentLabel")}
            contentStatus={t("documents.declarationContentStatus")}
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