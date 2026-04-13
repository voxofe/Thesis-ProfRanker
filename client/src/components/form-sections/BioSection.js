import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
import Upload from "../Upload";

export default function BioSection() {
  const { formData, handleFileChange, handleFileDelete } = useFormData();

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
        required={true}
      />
    </div>
  );
}