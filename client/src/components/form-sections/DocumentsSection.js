import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { useAuth } from "../../contexts/AuthContext";
import Upload from "../Upload";
import Checkbox from "../Checkbox";

export default function DocumentsSection({ academicYear }) {
  const { formData, handleChange, handleFileChange, handleFileDelete } =
    useFormData();
  const { currentUser } = useAuth();

  const requiresMilitaryDoc = currentUser?.gender === "male";

  return (
    <div className="space-y-6">
      <Upload
        icon="document-text"
        label={`Υπεύθυνη δήλωση εκπλήρωσης στρατιωτικών υποχρεώσεων ή νόμιμης απαλλαγής από αυτές ή αναβολής για το ακαδημαϊκό έτος ${academicYear}`}
        content="την υπεύθυνη δήλωση"
        id="military-obligations-upload"
        name="military-obligations-upload"
        accept=".pdf,.doc,.docx,.odt"
        uploadedFile={formData.militaryObligationsDocument}
        onChange={(e) => handleFileChange("militaryObligationsDocument", e)}
        onDelete={() => handleFileDelete("militaryObligationsDocument")}
        required={requiresMilitaryDoc}
        compact
      />

      {formData.isPublicEmployee && (
        <Upload
          icon="document-text"
          label="Αίτηση για έκδοση σχετικής άδειας από το αρμόδιο όργανο"
          content="την πρωτοκολλημένη αίτηση"
          id="public-employee-permission-upload"
          name="public-employee-permission-upload"
          accept=".pdf,.doc,.docx,.odt"
          uploadedFile={formData.publicEmployeePermissionDocument}
          onChange={(e) =>
            handleFileChange("publicEmployeePermissionDocument", e)
          }
          onDelete={() => handleFileDelete("publicEmployeePermissionDocument")}
          required={formData.isPublicEmployee}
          compact
        />
      )}

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