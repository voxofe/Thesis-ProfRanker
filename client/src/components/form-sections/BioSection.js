import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
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

  return (
    <div className="space-y-6">
      <Upload
        icon="document-text"
        label="Βιογραφικό σημείωμα"
        content="το βιογραφικό σας"
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
        label="Εγγράφα που τεκμηριώνουν τα διαλαμβανόμενα στο βιογραφικό"
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