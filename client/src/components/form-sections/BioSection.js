import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { useAuth } from "../../contexts/AuthContext";
import CustomSelect from "../CustomSelect";
import Upload from "../Upload";
import Checkbox from "../Checkbox";

export default function BioSection({ academicYear }) {
  const { formData, handleChange, handleFileChange, handleFileDelete } =
    useFormData();
  const { currentUser } = useAuth();
  const requiresMilitaryDoc = currentUser?.gender === "male";

  const workExperienceOptions = Array.from({ length: 11 }, (_, index) => ({
    value: String(index),
    label: String(index),
  }));

  return (
    <div className="space-y-6">
      {/* Work Experience Section */}

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

      {/* Military Obligations Section */}

      <Upload
        icon="document-text"
        label={`Υπεύθυνη δήλωση εκπλήρωσης στρατιωτικών υποχρεώσεων ή νόμιμης απαλλαγής από αυτές ή αναβολής για το ακαδημαϊκό έτος ${academicYear}`}
        content="την υπεύθυνη δήλωση"
        id="military-obligations-upload"
        name="military-obligations-upload"
        accept=".pdf,.doc,.docx, .odt"
        uploadedFile={formData.militaryObligationsDocument}
        onChange={(e) => handleFileChange("militaryObligationsDocument", e)}
        onDelete={() => handleFileDelete("militaryObligationsDocument")}
        required={requiresMilitaryDoc}
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
