import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { useLanguage } from "../../contexts";
import Upload from "../Upload";
import MultipleUploadStrip from "../MultipleUploadStrip";

export default function BioSection() {
  const {
    formData,
    documentVault,
    handleFileChange,
    handleFileDelete,
    addBioSupportingDocument,
    removeBioSupportingDocument,
  } = useFormData();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Upload
        icon="document-text"
        label={t("sections.bio.label")}
        content={t("sections.bio.content")}
        id="cv-upload"
        name="cv-upload"
        accept=".pdf,.doc,.docx,.odt"
        uploadedFile={formData.cvDocument}
        onChange={(e) => handleFileChange("cvDocument", e)}
        onDelete={() => handleFileDelete("cvDocument")}
        existingOptions={documentVault?.cv}
        onSelectExisting={(doc) => handleFileChange("cvDocument", doc)}
        required={true}
      />

      <MultipleUploadStrip
        label={t("sections.bio.supportingDocs")}
        files={formData.bioSupportingDocuments}
        accept=".pdf,.doc,.docx,.odt"
        onAddFile={addBioSupportingDocument}
        onDeleteFile={removeBioSupportingDocument}
        existingOptions={documentVault?.bio_supporting}
        required={true}
      />
    </div>
  );
}