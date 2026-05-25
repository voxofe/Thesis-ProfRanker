import React from "react";
import InputField from "../InputField";
import { useFormData } from "../../contexts/FormDataContext";
import Upload from "../Upload";
import Checkbox from "../Checkbox";
import FlowbiteDateField from "../FlowbiteDateField";

export default function PhdSection() {
  const {
    formData,
    documentVault,
    phdDocumentStatus,
    profilePolling,
    handleChange,
    handleFileChange,
    handleFileDelete,
    handlePhdTitleChange,
    handlePhdDateChange,
    handlePhdDocumentChange,
    handlePhdForeignInstituteChange,
  } = useFormData();
  const today = new Date().toISOString().split("T")[0];
  const todayDisplay = today.split("-").reverse().join("-");

  return (
    <div className="space-y-3 overflow-visible">
      {/* PhD Document Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Upload
            compact
            icon="document-text"
            label="Διδακτορικό δίπλωμα (Φωτοαντίγραφο ή σκαναρισμένο αντίγραφο)"
            content="το διδακτορικό σας"
            id="phd-upload"
            name="phd-upload"
            accept=".pdf"
            maxFileBytes={30 * 1024 * 1024}
            uploadedFile={formData.phdDocument}
            onChange={(e) => handlePhdDocumentChange(e)}
            onDelete={() => handleFileDelete("phdDocument")}
            existingOptions={documentVault?.phd}
            onSelectExisting={(doc) => handlePhdDocumentChange(doc)}
            required={true}
          />
        </div>

        <div className="grid grid-rows-[auto_1fr_auto] h-full">
          <InputField
            label="Τίτλος διδακτορικής διατριβής"
            id="phd-title"
            name="phd-title"
            type="text"
            placeholder="Εισάγετε τον τίτλο της διδακτορικής διατριβής"
            value={formData.phdTitle}
            onChange={(value) => handlePhdTitleChange(value)}
            required={true}
          />

          <div></div>

          <div>
            <FlowbiteDateField
              label="Ημερομηνία λήψης διδακτορικού τίτλου"
              value={formData.phdAcquisitionDate}
              onChange={(value) => handlePhdDateChange(value)}
              minDate="2011-01-01"
              maxDate={today}
              required={true}
            />
            <p className="-mt-3 text-xs text-gray-500 italic">
              Επιτρεπτό εύρος: 01-01-2011 έως {todayDisplay}
            </p>
          </div>
          {/* <InputField
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
          /> */}
        </div>
      </div>

      {/* Foreign Institute Recognition */}
      <div className="bg-patras-goldSand/20 p-3 rounded-lg">
        <div className="space-y-4">
          <Checkbox
            label="Κατοχή τίτλου από ίδρυμα του εξωτερικού (αναγνωρισμένο από τον ΔΟΑΤΑΠ)"
            id="foreign-institute"
            name="foreign-institute"
            checked={formData.phdIsFromForeignInstitute}
            onChange={(value) => handlePhdForeignInstituteChange(value)}
          />

          {formData.phdIsFromForeignInstitute && (
            <div className="mt-4 p-4 bg-white rounded-md border border-blue-200 overflow-y-auto">
              <Upload
                icon="document-text"
                label="Έγγραφο αναγνώρισης ΔΟΑΤΑΠ"
                content="το έγγραφο αναγνώρισης από τον ΔΟΑΤΑΠ"
                id="doatap-upload"
                name="doatap-upload"
                accept=".pdf,.doc,.docx, .odt"
                uploadedFile={formData.doatapDocument}
                onChange={(e) => handleFileChange("doatapDocument", e)}
                onDelete={() => handleFileDelete("doatapDocument")}
                existingOptions={documentVault?.doatap}
                onSelectExisting={(doc) => handleFileChange("doatapDocument", doc)}
                required={formData.phdIsFromForeignInstitute}
              />
            </div>
          )}
        </div>
      </div>

      {phdDocumentStatus?.status === "pending" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Γίνεται έλεγχος του PDF της διδακτορικής διατριβής. Θα εμφανιστεί ενημέρωση μόλις ολοκληρωθεί.
          {profilePolling && " (Ανανέωση σε εξέλιξη)"}
        </div>
      )}
      {phdDocumentStatus?.status === "failed" && phdDocumentStatus?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {phdDocumentStatus.error}
        </div>
      )}
    </div>
  );
}
