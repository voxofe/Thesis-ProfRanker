import React from "react";
import InputField from "../InputField";
import { useFormData } from "../../contexts/FormDataContext";
import Upload from "../Upload";
import Checkbox from "../Checkbox";

export default function PhdSection() {
  const { formData, handleChange, handleFileChange, handleFileDelete } =
    useFormData();
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-3">
      {/* PhD Document Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Upload
            compact
            icon="document-text"
            label="Διδακτορικό Δίπλωμα"
            content="το διδακτορικό σας"
            id="phd-upload"
            name="phd-upload"
            accept=".pdf,.doc,.docx, .odt"
            uploadedFile={formData.phdDocument}
            onChange={(e) => handleFileChange("phdDocument", e)}
            onDelete={() => handleFileDelete("phdDocument")}
            required={true}
          />
        </div>

        <div className="grid grid-rows-[auto_1fr_auto] h-full">
          <InputField
            label="Τίτλος Διδακτορικής Διατριβής"
            id="phd-title"
            name="phd-title"
            type="text"
            placeholder="Εισάγετε τον τίτλο της διδακτορικής διατριβής"
            value={formData.phdTitle}
            onChange={(value) => handleChange("phdTitle", value)}
            required={true}
          />

          <div></div>

          <InputField
            label="Ημερομηνία λήψης διδακτορικού τίτλου"
            id="date-field"
            name="date-field"
            type="date"
            max={today}
            min="2011-01-01"
            defaultValue={today}
            value={formData.phdAcquisitionDate}
            onChange={(value) => handleChange("phdAcquisitionDate", value)}
            required={true}
          />
        </div>
      </div>

      {/* Foreign Institute Recognition */}
      <div className="bg-patras-goldSand/20 p-6 rounded-lg">
        <h3 className="text-base font-medium text-gray-900 mb-4">
          Αναγνώριση από Εξωτερικό Ίδρυμα
        </h3>

        <div className="space-y-4">
          <Checkbox
            label="Κατοχή τίτλου από Ίδρυμα του εξωτερικού (αναγνωρισμένο από τον ΔΟΑΤΑΠ)"
            id="foreign-institute"
            name="foreign-institute"
            checked={formData.phdIsFromForeignInstitute}
            onChange={(value) =>
              handleChange("phdIsFromForeignInstitute", value)
            }
          />

          {formData.phdIsFromForeignInstitute && (
            <div className="mt-4 p-4 bg-white rounded-md border border-blue-200">
              <Upload
                icon="document-text"
                label="Έγγραφο Αναγνώρισης ΔΟΑΤΑΠ"
                content="το έγγραφο αναγνώρισης από τον ΔΟΑΤΑΠ"
                id="doatap-upload"
                name="doatap-upload"
                accept=".pdf,.doc,.docx, .odt"
                uploadedFile={formData.doatapDocument}
                onChange={(e) => handleFileChange("doatapDocument", e)}
                onDelete={() => handleFileDelete("doatapDocument")}
                required={formData.phdIsFromForeignInstitute}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
