import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
import CustomSelect from "../CustomSelect";
import Upload from "../Upload";

export default function WorkExperienceSection() {
  const { formData, handleChange, handleFileChange, handleFileDelete } =
    useFormData();

  const workExperienceOptions = Array.from({ length: 11 }, (_, index) => ({
    value: String(index),
    label: String(index),
  }));

  return (
    <div className="space-y-6">
      <CustomSelect
        label="Χρόνια μεταδιδακτορικής εργασιακής εμπειρίας (εξαιρείται η διδακτική εμπειρία)"
        value={
          formData.workExperience === ""
            ? ""
            : String(formData.workExperience)
        }
        onChange={(value) => {
          if (value === "select") {
            handleChange("workExperience", "");
            return;
          }
          handleChange("workExperience", Number(value));
        }}
        options={workExperienceOptions}
        required={true}
      />

      <Upload
        icon="document-text"
        label="Βεβαιώσεις προϋπηρεσίας από τον Φορέα / Συμβάσεις ως τεκμήρια μεταδιδακτορικής εργασιακής εμπειρίας (εξαιρείται η διδακτική εμπειρία)"
        content="τη βεβαίωση προϋπηρεσίας"
        id="employment-certificate-upload"
        name="employment-certificate-upload"
        accept=".pdf,.doc,.docx,.odt"
        uploadedFile={formData.employmentCertificateDocument}
        onChange={(e) => handleFileChange("employmentCertificateDocument", e)}
        onDelete={() => handleFileDelete("employmentCertificateDocument")}
        required={true}
        compact
      />
    </div>
  );
}