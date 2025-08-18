import React, { useMemo } from "react";
import { useFormData } from "../contexts/FormDataContext";
import InputField from "./InputField";

export default function Paper({ index }) {
  const lastYear = 2021;
  const scimagoYears = Array.from({ length: lastYear - 1999 + 1 }, (_, i) => {
    const year = (1999 + i).toString();
    return { label: year, value: year };
  });

  const { formData, handleChange } = useFormData();
  const paper = useMemo(
    () => formData.papers[index] || {},
    [formData.papers, index]
  );

  const isJournalType = paper.type === "journal";
  const isConferenceType = paper.type === "conference";
  const isOtherType = paper.type === "other" || !paper.type;

  const updatePaperField = (field, value) => {
    const updatedPapers = [...formData.papers];

    // Ensure the paper object exists at this index
    if (!updatedPapers[index]) {
      updatedPapers[index] = {};
    }

    // Update the specific field
    updatedPapers[index] = {
      ...updatedPapers[index],
      [field]: value,
    };

    // Handle field clearing based on type
    if (field === "type") {
      if (value === "other" || !value) {
        updatedPapers[index].issn = "";
        updatedPapers[index].country = "";
        updatedPapers[index].journalConfTitle = "";
      } else if (value === "conference") {
        updatedPapers[index].issn = "";
        updatedPapers[index].country = "";
      }
    }

    handleChange("papers", updatedPapers);
  };

  const handleDelete = () => {
    const updatedPapers = formData.papers.filter((_, i) => i !== index);
    handleChange("papers", updatedPapers);
  };

  const handleClearFields = () => {
    const updatedPapers = [...formData.papers];
    updatedPapers[index] = {
      type: "",
      paperTitle: "",
      journalConfTitle: "",
      year: "",
      issn: "",
    };
    handleChange("papers", updatedPapers);
  };

  const getIssnErrorMessage = (issn) => {
    if (issn && issn.toLowerCase().includes("wrong")) {
      return "Το ISSN που εισάγατε δεν είναι έγκυρο ή δεν βρέθηκε στη βάση δεδομένων.";
    }
    return "";
  };

  return (
    <div className="grid sm:flex sm:flex-col gap-x-8 rounded-md border border-patras-cameo bg-patras-albescentWhite/30 px-4 pt-2 pb-5 relative">
      <div className="sm:grid sm:grid-cols-2 gap-x-8">
        <div className="sm:flex sm:flex-row sm:justify-start sm:gap-x-8">
          <InputField
            label="Είδος"
            id={`paper-type-${index}`}
            name={`paper-type-${index}`}
            optns={[
              {
                label: "Δημοσίευση σε επιστημονικό περιοδικό",
                value: "journal",
              },
              { label: "Ανακοίνωση σε συνέδριο", value: "conference" },
              { label: "Άλλο είδος εργασίας", value: "other" },
            ]}
            isDropdown={true}
            value={paper.type || ""}
            onChange={(value) => updatePaperField("type", value)}
            style={`sm:w-[80%]`}
            required={true}
          />
          <InputField
            label="Έτος"
            id={`year-${index}`}
            name={`year-${index}`}
            optns={scimagoYears}
            isDropdown={true}
            value={paper.year || ""}
            onChange={(value) => updatePaperField("year", value)}
            style={`sm:w-[20%]`}
            required={true}
          />
        </div>
        <InputField
          label="Τίτλος Εργασίας"
          id={`paper-title-${index}`}
          name={`paper-title-${index}`}
          type="text"
          value={paper.paperTitle || ""}
          onChange={(value) => updatePaperField("paperTitle", value)}
          required={true}
        />
      </div>

      <div className="sm:grid sm:grid-cols-2 gap-x-8">
        <InputField
          label={
            isOtherType
              ? "Τίτλος περιοδικού / συνεδρίου"
              : isConferenceType
              ? "Τίτλος συνεδρίου"
              : "Τίτλος περιοδικού"
          }
          id={`journal/conference-${index}`}
          name={`journal/conference-${index}`}
          type="text"
          value={paper.journalConfTitle || ""}
          onChange={(value) => updatePaperField("journalConfTitle", value)}
          disabled={isOtherType}
          required={!isOtherType}
        />
        <div className="sm:grid sm:grid-cols-1 gap-x-8">
          <InputField
            label="ISSN περιοδικού"
            id={`issn-${index}`}
            name={`issn-${index}`}
            type="text"
            value={(paper.issn || "").replace(/\(wrong\)/gi, "").trim()}
            onChange={(value) => updatePaperField("issn", value)}
            disabled={!isJournalType}
            required={isJournalType}
          />
          {getIssnErrorMessage(paper.issn) && (
            <span className="text-xs text-red-600 block pb-3">
              {getIssnErrorMessage(paper.issn)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-2">
        <button
          onClick={handleClearFields}
          type="button"
          className="rounded-md bg-patras-cameo px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Καθαρισμός
        </button>
        <button
          onClick={handleDelete}
          type="button"
          className="rounded-md bg-patras-sanguineBrown px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Διαγραφή
        </button>
      </div>
    </div>
  );
}
