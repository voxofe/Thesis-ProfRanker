import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
import CustomSelect from "../CustomSelect";
import EmploymentCertificatesUploadStrip from "../EmploymentCertificatesUploadStrip";

export default function WorkExperienceSection() {
  const { formData, handleChange, addEmploymentCertificate, removeEmploymentCertificate } =
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

      <EmploymentCertificatesUploadStrip
        label="Βεβαιώσεις προϋπηρεσίας από τον Φορέα / Συμβάσεις ως τεκμήρια μεταδιδακτορικής εργασιακής εμπειρίας (εξαιρείται η διδακτική εμπειρία)"
        files={formData.employmentCertificates}
        accept=".pdf,.doc,.docx,.odt"
        onAddFile={addEmploymentCertificate}
        onDeleteFile={removeEmploymentCertificate}
        required={true}
      />
    </div>
  );
}