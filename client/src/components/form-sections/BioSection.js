import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
import InputField from "../InputField";
import Upload from "../Upload";
import Checkbox from "../Checkbox";

export default function BioSection({ academicYear }) {
  const { formData, handleChange, handleFileChange, handleFileDelete } =
    useFormData();

  const handleWorkExperienceChange = (value) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0 || numValue > 10) {
      return; // Don't update if out of range
    }
    handleChange("workExperience", numValue);
  };

  const workExperienceError =
    formData.workExperience < 0 || formData.workExperience > 10
      ? "Τα χρόνια εργασιακής εμπειρίας πρέπει να είναι μεταξύ 0 και 10"
      : null;

  return (
    <div className="space-y-6">
      {/* Work Experience Section */}

      <InputField
        label="Χρόνια μεταδιδακτορικής εργασιακής εμπειρίας (εξαιρείται η διδακτική εμπειρία)"
        id="experience-years"
        name="experience-years"
        type="number"
        min="0"
        max="10"
        defaultValue={0}
        value={formData.workExperience}
        onChange={handleWorkExperienceChange}
        error={workExperienceError}
        required={true}
      />

      {/* Military Obligations Section */}

      <Upload
        icon="document-text"
        label={`Υπεύθυνη Δήλωση εκπλήρωσης Στρατιωτικών Υποχρεώσεων ή νόμιμης απαλλαγής από αυτών ή αναβολής για το ακαδημαϊκό έτος ${academicYear}`}
        content="την υπεύθυνη δήλωση"
        id="military-obligations-upload"
        name="military-obligations-upload"
        accept=".pdf,.doc,.docx, .odt"
        uploadedFile={formData.militaryObligationsDocument}
        onChange={(e) => handleFileChange("militaryObligationsDocument", e)}
        onDelete={() => handleFileDelete("militaryObligationsDocument")}
        required={true}
        compact
      />

      {/* Declaration Section */}
      <Checkbox
        label="Δεν έχω επιλεγεί σε άλλο πρόγραμμα Απόκτησης Ακαδημαϊκής Διδακτικής Εμπειρίας, στο πλαίσιο των προηγούμενων προσκλήσεων ΕΔΒΜ 20 (ακαδ. έτος 2016‐2017), ΕΔΒΜ 45 (ακαδ. έτος 2017‐2018), ΕΔΒΜ 82 (ακαδ. έτος 2018‐2019), καθώς και της ΕΔΒΜ 96 (ακαδ. έτη 2019‐2020 και 2020‐2021) του ΕΠ ΑΝΑΔ ΕΔΒΜ 2014‐2020."
        id="not-participated"
        name="not-participated"
        checked={formData.hasNotParticipatedInPastProgram}
        onChange={(value) =>
          handleChange("hasNotParticipatedInPastProgram", value)
        }
      />
    </div>
  );
}
