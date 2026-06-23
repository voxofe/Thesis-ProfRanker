import React, { useEffect, useMemo, useRef, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import InputField from "../InputField";
import { useFormData } from "../../contexts/FormDataContext";
import Upload from "../Upload";
import Checkbox from "../Checkbox";
import FlowbiteDateField from "../FlowbiteDateField";
import PhdAbstractField from "../PhdAbstractField";

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
    handlePhdKeywordsChange,
    handlePhdDocumentChange,
    handlePhdForeignInstituteChange,
    handlePhdDegreeSelect,
    phdDegrees,
  } = useFormData();
  const today = new Date().toISOString().split("T")[0];
  const todayDisplay = today.split("-").reverse().join("-");
  const [keywordInput, setKeywordInput] = useState("");
  const keywordCount = Array.isArray(formData.phdKeywords)
    ? formData.phdKeywords.length
    : 0;
  const keywordLimitReached = keywordCount >= PHD_KEYWORDS_MAX;
  const keywordsTooFew = keywordCount > 0 && keywordCount < PHD_KEYWORDS_MIN;
  const keywordsTooMany = keywordCount > PHD_KEYWORDS_MAX;
  const phdTitleValue = (formData.phdTitle || "").trim();
  const showPhdTitleTooltip = phdTitleValue.length > 60;
  const keywordInputRef = useRef(null);
  const phdTitleInputRef = useRef(null);
  const abstractRef = useRef(null);
  const [phdTitleQuery, setPhdTitleQuery] = useState(formData.phdTitle || "");
  const [phdTitleOpen, setPhdTitleOpen] = useState(false);
  const [abstractMinHeight, setAbstractMinHeight] = useState(0);

  useEffect(() => {
    setPhdTitleQuery(formData.phdTitle || "");
  }, [formData.phdTitle]);

  useEffect(() => {
    if (!abstractRef.current) return;
    if (!abstractMinHeight) {
      setAbstractMinHeight(abstractRef.current.scrollHeight);
    }
  }, [abstractMinHeight]);

  useEffect(() => {
    const element = abstractRef.current;
    if (!element) return;
    element.style.height = "auto";
    const nextHeight = Math.max(
      element.scrollHeight,
      abstractMinHeight || element.scrollHeight
    );
    element.style.height = `${nextHeight}px`;
  }, [formData.phdAbstract, abstractMinHeight]);

  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase("el-GR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const formatDate = (value) => {
    if (!value) return "";
    const parts = String(value).split("-");
    if (parts.length !== 3) return value;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const phdTitleOptions = useMemo(() => {
    if (!Array.isArray(phdDegrees)) return [];
    return phdDegrees.map((degree, index) => {
      const title = (degree.title || "").trim();
      const date = degree.acquiredAt ? formatDate(degree.acquiredAt) : "";
      const fallbackLabel = `Διδακτορικό ${index + 1}${date ? ` (${date})` : ""}`;
      return {
        id: degree.id,
        title,
        label: title || fallbackLabel,
        search: normalize(`${title} ${fallbackLabel} ${date}`),
      };
    });
  }, [phdDegrees]);

  const filteredPhdTitles = useMemo(() => {
    const query = normalize(phdTitleQuery);
    if (!query) return phdTitleOptions;
    return phdTitleOptions.filter((option) => option.search.includes(query));
  }, [phdTitleOptions, phdTitleQuery]);

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

  const clearKeywords = () => {
    handlePhdKeywordsChange([]);
    setKeywordInput("");
  };

  return (
    <div className="space-y-3 overflow-visible">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <label
            htmlFor="phd-title"
            className="block text-sm/6 font-medium text-gray-900 dark:text-[var(--color-text-primary)]"
          >
            Τίτλος διδακτορικής διατριβής
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="mt-2 relative">
            <input
              id="phd-title"
              name="phd-title"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={phdTitleQuery}
              onChange={(event) => {
                const nextValue = event.target.value;
                setPhdTitleQuery(nextValue);
                handlePhdTitleChange(nextValue);
                setPhdTitleOpen(true);
              }}
              onFocus={() => setPhdTitleOpen(true)}
              onBlur={() => {
                setTimeout(() => setPhdTitleOpen(false), 150);
              }}
              placeholder="Εισάγετε τον τίτλο της διδακτορικής διατριβής"
              title={showPhdTitleTooltip ? phdTitleValue : ""}
              ref={phdTitleInputRef}
              className="block w-full rounded-md px-3 py-1.5 pr-10 text-base text-gray-900 dark:text-[var(--color-text-primary)] outline outline-1 -outline-offset-1 placeholder:text-gray-400 dark:text-[var(--color-text-muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-patras-buccaneer focus:ring-offset-0 focus:ring-patras-buccaneer sm:text-sm/6"
            />
            {phdTitleQuery && (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setPhdTitleQuery("");
                  handlePhdTitleChange("");
                              setPhdTitleOpen(true);
                  phdTitleInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-patras-sanguineBrown hover:text-red-700 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50"
                aria-label="Καθαρισμός τίτλου"
                title="Καθαρισμός τίτλου"
              >
                <span className="text-2xl leading-none font-bold">×</span>
              </button>
            )}
            {phdTitleOpen && filteredPhdTitles.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-md border border-patras-buccaneer/20 bg-white dark:bg-[var(--color-bg-card)] shadow-lg">
                <div className="max-h-56 overflow-auto">
                  {filteredPhdTitles.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        handlePhdDegreeSelect(option.id);
                        setPhdTitleQuery(option.title || option.label);
                        setPhdTitleOpen(false);
                      }}
                                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-900 dark:text-[var(--color-text-primary)] hover:bg-patras-buccaneer hover:text-white"
                      title={option.label}
                    >
                      <span className="truncate">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <FlowbiteDateField
            label="Ημερομηνία λήψης διδακτορικού τίτλου"
            value={formData.phdAcquisitionDate}
            onChange={(value) => handlePhdDateChange(value)}
            minDate="2011-01-01"
            maxDate={today}
            required={true}
            popupPlacement="bottom"
          />
          <p className="-mt-3 text-xs text-gray-500 dark:text-[var(--color-text-muted)] italic">
            Επιτρεπτό εύρος: 01-01-2011 έως {todayDisplay}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Upload
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
        <PhdAbstractField
          value={formData.phdAbstract}
          onChange={handlePhdAbstractChange}
          minWords={PHD_ABSTRACT_MIN_WORDS}
          maxWords={PHD_ABSTRACT_MAX_WORDS}
          placeholder="Γράψτε μια σύντομη περίληψη της διατριβής σας"
          required
        />

        <div className="py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 ">
            <label
              htmlFor="phd-keywords"
              className="block text-sm/6 font-medium text-gray-900 dark:text-[var(--color-text-primary)]"
            >
              Λέξεις-κλειδιά
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          <div
            className="relative mt-2 flex w-full flex-wrap items-center gap-2 rounded-md bg-white dark:bg-[var(--color-bg-card)] px-3 py-3 text-base sm:text-sm/6 outline outline-1 -outline-offset-1 outline-patras-buccaneer focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-patras-buccaneer focus-within:ring-1 focus-within:ring-offset-0 focus-within:ring-patras-buccaneer"
            onClick={(event) => {
              if (event.target.closest("button") || event.target.tagName === "INPUT") {
                return;
              }
              keywordInputRef.current?.focus();
            }}
          >
            {(formData.phdKeywords || []).map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 rounded-full bg-patras-goldSand/30 px-3 py-1 text-sm text-gray-800 dark:text-[var(--color-text-primary)]"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removePhdKeyword(keyword)}
                  className="text-gray-500 dark:text-[var(--color-text-muted)] hover:text-gray-800 dark:text-[var(--color-text-primary)]"
                  aria-label={`Αφαίρεση λέξης-κλειδιού ${keyword}`}
                >
                  ×
                </button>
              </span>
            ))}
            {!keywordLimitReached && (
              <input
                id="phd-keywords"
                name="phd-keywords"
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                onBlur={commitKeyword}
                placeholder=""
                className="flex-1 min-w-[180px] border-0 p-0 text-sm text-gray-900 dark:text-[var(--color-text-primary)] placeholder:text-gray-400 dark:text-[var(--color-text-muted)] outline-none focus:ring-0"
                ref={keywordInputRef}
              />
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-500 dark:text-[var(--color-text-muted)]">
              Πληκτρολογήστε και πατήστε Enter ή κόμμα για να προσθέσετε λέξη-κλειδί.
            </p>
            <button
              type="button"
              onClick={clearKeywords}
              disabled={keywordCount === 0}
              className="inline-flex items-center gap-1 rounded-md border border-patras-buccaneer/30 bg-patras-albescentWhite/30 px-3 py-1 text-sm text-patras-buccaneer hover:bg-patras-albescentWhite disabled:cursor-not-allowed disabled:border-gray-200 dark:border-[var(--color-border)] disabled:bg-gray-100 dark:bg-[var(--color-bg-surface)] dark:hover:bg-[var(--color-bg-muted)] disabled:text-gray-400 dark:text-[var(--color-text-muted)]"
              aria-label="Καθαρισμός λέξεων-κλειδιών"
              title="Καθαρισμός"
            >
              <span>Καθαρισμός</span>
              <TrashIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-[var(--color-text-muted)]">
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
            <div className="mt-4 p-4 bg-white dark:bg-[var(--color-bg-card)] rounded-md border border-blue-200 overflow-y-auto">
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
