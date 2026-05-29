import React, { useState } from "react";
import InputField from "../InputField";
import { useFormData } from "../../contexts/FormDataContext";
import Upload from "../Upload";
import Checkbox from "../Checkbox";
import FlowbiteDateField from "../FlowbiteDateField";

const PHD_ABSTRACT_MIN_WORDS = 200;
const PHD_ABSTRACT_MAX_WORDS = 1000;
const PHD_KEYWORDS_MIN = 3;
const PHD_KEYWORDS_MAX = 10;

export default function PhdSection() {
  const {
    formData,
    documentVault,
    handleFileChange,
    handleFileDelete,
    handlePhdTitleChange,
    handlePhdDateChange,
    handlePhdAbstractChange,
    addPhdKeyword,
    removePhdKeyword,
    handlePhdDocumentChange,
    handlePhdForeignInstituteChange,
  } = useFormData();
  const today = new Date().toISOString().split("T")[0];
  const todayDisplay = today.split("-").reverse().join("-");
  const [keywordInput, setKeywordInput] = useState("");
  const abstractValue = (formData.phdAbstract || "").trim();
  const abstractWordCount = abstractValue
    ? abstractValue.split(/\s+/).filter(Boolean).length
    : 0;
  const abstractTooShort =
    abstractWordCount > 0 && abstractWordCount < PHD_ABSTRACT_MIN_WORDS;
  const abstractTooLong = abstractWordCount > PHD_ABSTRACT_MAX_WORDS;
  const keywordCount = Array.isArray(formData.phdKeywords)
    ? formData.phdKeywords.length
    : 0;
  const keywordsTooFew = keywordCount > 0 && keywordCount < PHD_KEYWORDS_MIN;
  const keywordsTooMany = keywordCount > PHD_KEYWORDS_MAX;

  const commitKeyword = () => {
    const nextValue = keywordInput.trim();
    if (!nextValue) return;
    addPhdKeyword(nextValue);
    setKeywordInput("");
  };

  const handleKeywordKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitKeyword();
    }
  };

  return (
    <div className="space-y-3 overflow-visible">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      <div className="space-y-4">
        <Upload
          compact
          icon="document-text"
          label="Διδακτορικό δίπλωμα (φωτοαντίγραφο ή σκαναρισμένο αντίγραφο)"
          content="το διδακτορικό σας"
          id="phd-upload"
          name="phd-upload"
          accept=".pdf,.doc,.docx,.odt"
          maxFileBytes={30 * 1024 * 1024}
          uploadedFile={formData.phdDocument}
          onChange={(e) => handlePhdDocumentChange(e)}
          onDelete={() => handleFileDelete("phdDocument")}
          existingOptions={documentVault?.phd}
          onSelectExisting={(doc) => handlePhdDocumentChange(doc)}
          required={true}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="phd-abstract"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Περίληψη διδακτορικής διατριβής
          </label>
          <div className="mt-2">
            <textarea
              id="phd-abstract"
              name="phd-abstract"
              rows={4}
              value={formData.phdAbstract || ""}
              onChange={(e) => handlePhdAbstractChange(e.target.value)}
              className={`block w-full rounded-md px-3 py-2 text-sm text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-patras-buccaneer ${
                abstractTooShort ? "outline-red-500 focus:outline-red-500" : ""
              }`}
              placeholder="Γράψτε μια σύντομη περίληψη της διατριβής σας"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {abstractWordCount} λέξεις
          </p>
          {abstractTooShort && (
            <p className="mt-1 text-xs text-red-600">
              Ελάχιστο {PHD_ABSTRACT_MIN_WORDS} λέξεις.
            </p>
          )}
          {abstractTooLong && (
            <p className="mt-1 text-xs text-red-600">
              Μέγιστο {PHD_ABSTRACT_MAX_WORDS} λέξεις.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phd-keywords"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Λέξεις-κλειδιά
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2">
            {(formData.phdKeywords || []).map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 rounded-full bg-patras-goldSand/30 px-3 py-1 text-xs text-gray-800"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removePhdKeyword(keyword)}
                  className="text-gray-500 hover:text-gray-800"
                  aria-label={`Αφαίρεση λέξης-κλειδιού ${keyword}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="phd-keywords"
              name="phd-keywords"
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              onBlur={commitKeyword}
              placeholder="Πληκτρολογήστε και πατήστε Enter"
              className="flex-1 min-w-[180px] border-0 p-0 text-sm text-gray-900 outline-none focus:ring-0"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Πατήστε Enter ή κόμμα για να προσθέσετε λέξη-κλειδί.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {keywordCount}/{PHD_KEYWORDS_MAX} λέξεις-κλειδιά
          </p>
          {(keywordsTooFew || keywordsTooMany) && (
            <p className="mt-1 text-xs text-red-600">
              Επιτρέπονται {PHD_KEYWORDS_MIN} έως {PHD_KEYWORDS_MAX} λέξεις-κλειδιά.
            </p>
          )}
        </div>
      </div>

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
                accept=".pdf,.doc,.docx,.odt"
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

    </div>
  );
}
