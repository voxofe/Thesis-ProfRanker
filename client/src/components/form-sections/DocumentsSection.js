import React, { useState } from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { useAuth } from "../../contexts/AuthContext";
import Upload from "../Upload";
import Checkbox from "../Checkbox";

export default function DocumentsSection({ academicYear }) {
  const { formData, handleChange, handleFileChange, handleFileDelete } =
    useFormData();
  const { currentUser } = useAuth();
  const [isRestrictionsModalOpen, setIsRestrictionsModalOpen] = useState(false);

  const requiresMilitaryDoc = currentUser?.gender === "male";

  return (
    <div className="space-y-6">
        <Upload
            icon="document-text"
            label={
              <>
                Υπεύθυνη δήλωση σχετικά με τους{" "}
                <button
                  type="button"
                  className="text-patras-buccaneer underline hover:text-patras-auChico"
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
            required={true}
            compact
        />
                    
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
            required={true}
            compact
        />
        )}

      <div className="bg-patras-goldSand/20 p-6 rounded-lg">
        {/* <h3 className="text-base font-medium text-gray-900 mb-4">
          Δημόσιος υπάλληλος
        </h3> */}

        <div className="space-y-4">
          <Checkbox
            label="Είμαι δημόσιος υπάλληλος"
            id="is-public-employee"
            name="is-public-employee"
            checked={formData.isPublicEmployee}
            onChange={(value) => handleChange("isPublicEmployee", value)}
          />

          {formData.isPublicEmployee && (
            <div className="mt-4 p-4 bg-white rounded-md border border-blue-200 overflow-y-auto">
              <Upload
                icon="document-text"
                label="Πρωτοκολλημένη αίτηση για έκδοση σχετικής άδειας από το αρμόδιο όργανο"
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
                required={formData.isPublicEmployee}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-patras-goldSand/20 p-6 rounded-lg">
        {/* <h3 className="text-base font-medium text-gray-900 mb-4">
          Δήλωση μη προηγούμενης συμμετοχής
        </h3> */}

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
            <div className="mt-4 p-4 bg-white rounded-md border border-blue-200 overflow-y-auto">
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
                required={formData.hasNotParticipatedInPastProgram}
              />
            </div>
          )}
        </div>
      </div>

      {isRestrictionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg border w-full max-w-lg p-6 relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-600 hover:text-red-700 text-2xl"
              onClick={() => setIsRestrictionsModalOpen(false)}
              title="Κλείσιμο"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Όροι Πράξης
            </h2>
            <p className="text-sm text-gray-700">Όροι Πράξης</p>
          </div>
        </div>
      )}
    </div>
  );
}