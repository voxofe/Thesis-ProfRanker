import React, { useMemo } from "react";
import { useFormData } from "../contexts/FormDataContext";
import { useLanguage } from "../contexts";
import InputField from "./InputField";
import CustomSelect from "./CustomSelect";
import RadioButtons from "./RadioButtons";

export default function Publication({ index, readOnly = false }) {
  const lastYear = 2021;
  const scimagoYears = Array.from({ length: lastYear - 1999 + 1 }, (_, i) => {
    const year = (1999 + i).toString();
    return { label: year, value: year };
  });

  const { formData, handleChange } = useFormData();
  const { t } = useLanguage();
  const publication = useMemo(
    () => formData.publications[index] || {},
    [formData.publications, index]
  );

  const isJournalType = publication.type === "journal";
  const isConferenceProceedingsType = publication.type === "conference_proceedings";
  const isOtherGroup = [
    "book",
    "monograph",
    "conference_presentation",
    "other",
  ].includes(publication.type);
  const isConferencePresentationType =
    publication.type === "conference_presentation";
  const isBookType = publication.type === "book";
  const isMonographType = publication.type === "monograph";
  const isOtherType = publication.type === "other" || !publication.type;

  const authorsValue = Array.isArray(publication.authors)
    ? publication.authors.join(", ")
    : publication.authors || "";

  const mainTypeValue = isOtherGroup ? "other" : publication.type || "";

  const updatePublicationField = (field, value) => {
    if (readOnly) return;
    const updatedPublications = [...formData.publications];

    // Ensure the publication object exists at this index
    if (!updatedPublications[index]) {
      updatedPublications[index] = {};
    }

    // Update the specific field
    updatedPublications[index] = {
      ...updatedPublications[index],
      [field]: value,
    };

    // Handle field clearing based on type
    if (field === "type") {
      if (value === "journal") {
        updatedPublications[index].publisher = "";
      }

      if (value === "conference_proceedings") {
        updatedPublications[index].issn = "";
        updatedPublications[index].country = "";
      }

      if (["book", "monograph", "conference_presentation", "other"].includes(value)) {
        updatedPublications[index].issn = "";
        updatedPublications[index].country = "";
        if (value !== "conference_presentation") {
          updatedPublications[index].journalConfTitle = "";
        }
        if (!"book".includes(value) && !"monograph".includes(value)) {
          updatedPublications[index].publisher = "";
        }
      }
    }

    handleChange("publications", updatedPublications);
  };

  const handleDelete = () => {
    if (readOnly) return;
    const updatedPublications = formData.publications.filter((_, i) => i !== index);
    handleChange("publications", updatedPublications);
  };

  const handleClearFields = () => {
    if (readOnly) return;
    const updatedPublications = [...formData.publications];
    updatedPublications[index] = {
      type: "",
      publicationTitle: "",
      journalConfTitle: "",
      year: "",
      issn: "",
      authors: "",
      publisher: "",
    };
    handleChange("publications", updatedPublications);
  };

  const getIssnErrorMessage = (issn) => {
    if (issn && issn.toLowerCase().includes("wrong")) {
      return t("publication.issnInvalid");
    }
    return "";
  };

  return (
    <div className="pr-publication-card grid sm:flex sm:flex-col gap-x-8 rounded-md border border-patras-buccaneer/10 dark:border-[var(--color-border)] bg-patras-albescentWhite/30 dark:bg-[var(--color-bg-surface)] px-4 pt-6 pb-5 relative">
      <div className="pr-publication-number" aria-hidden="true">
        <span>{index + 1}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-8 gap-y-4 mt-4">
        <div className="col-span-1">
          <CustomSelect
            label={t("publication.type")}
            value={mainTypeValue}
            onChange={(value) => {
              if (value === "other") {
                updatePublicationField("type", "other");
                return;
              }
              updatePublicationField("type", value);
            }}
            readOnly={readOnly}
            options={[
              {
                label: t("publication.typeJournal"),
                value: "journal",
              },
              {
                label: t("publication.typeConference"),
                value: "conference_proceedings",
              },
              { label: t("publication.typeOther"), value: "other" },
            ]}
          />
        </div>
        <div className="col-span-1">
          <CustomSelect
            label={t("publication.year")}
            value={publication.year || ""}
            onChange={(value) => updatePublicationField("year", value)}
            readOnly={readOnly}
            options={scimagoYears}
          />
        </div>
        <div className="col-span-2">
          <InputField
            label={isOtherGroup ? t("publication.workTitle") : t("publication.publicationTitle")}
            id={`publication-title-${index}`}
            name={`publication-title-${index}`}
            type="text"
            value={publication.publicationTitle || ""}
            onChange={(value) => updatePublicationField("publicationTitle", value)}
            readOnly={readOnly}
          />
        </div>

        <div className="col-span-4">
          <InputField
            label={t("publication.authors")}
            id={`publication-authors-${index}`}
            name={`publication-authors-${index}`}
            type="text"
            value={authorsValue}
            onChange={(value) => updatePublicationField("authors", value)}
            readOnly={readOnly}
          />
        </div>
      </div>

      <div className="border-t border-patras-buccaneer/20 dark:border-[var(--color-border-soft)] my-4" />

      {isOtherGroup && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-8 gap-y-4">
          <div className="col-span-2">
            <RadioButtons
              label={t("publication.category")}
              name={`publication-category-${index}`}
              value={publication.type || "other"}
              onChange={(value) => updatePublicationField("type", value)}
              readOnly={readOnly}
              radioButtons={[
                { id: `other-book-${index}`, label: t("publication.book"), value: "book" },
                { id: `other-monograph-${index}`, label: t("publication.monograph"), value: "monograph" },
                {
                  id: `other-conf-${index}`,
                  label: t("publication.conferencePresentation"),
                  value: "conference_presentation",
                },
                { id: `other-other-${index}`, label: t("publication.other"), value: "other" },
              ]}
            />
          </div>
          <div className="col-span-2 sm:col-start-3 sm:col-span-2 sm:pl-10">
            {isConferencePresentationType && (
              <InputField
                label={t("publication.conferenceTitle")}
                id={`journal/conference-${index}`}
                name={`journal/conference-${index}`}
                type="text"
                value={publication.journalConfTitle || ""}
                onChange={(value) => updatePublicationField("journalConfTitle", value)}
                readOnly={readOnly}
              />
            )}
            {(isBookType || isMonographType) && (
              <InputField
                label={t("publication.publisher")}
                id={`publisher-${index}`}
                name={`publisher-${index}`}
                type="text"
                value={publication.publisher || ""}
                onChange={(value) => updatePublicationField("publisher", value)}
                readOnly={readOnly}
              />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-8 gap-y-4">
        <div className="col-span-2">
          {(isJournalType || isConferenceProceedingsType) && (
            <InputField
              label={
                isConferenceProceedingsType
                  ? t("publication.conferenceTitle")
                  : t("publication.journalTitle")
              }
              id={`journal/conference-${index}`}
              name={`journal/conference-${index}`}
              type="text"
              value={publication.journalConfTitle || ""}
              onChange={(value) => updatePublicationField("journalConfTitle", value)}
              readOnly={readOnly}
            />
          )}

          {(isBookType || isMonographType) && null}
        </div>
        <div className="col-span-2">
          {isJournalType && (
            <div>
              <InputField
                label={t("publication.issn")}
                id={`issn-${index}`}
                name={`issn-${index}`}
                type="text"
                value={(publication.issn || "").replace(/\(wrong\)/gi, "").trim()}
                onChange={(value) => updatePublicationField("issn", value)}
                readOnly={readOnly}
              />
              {getIssnErrorMessage(publication.issn) && (
                <span className="text-xs text-red-600 dark:text-[var(--color-danger)] block pb-3">
                  {getIssnErrorMessage(publication.issn)}
                </span>
              )}
            </div>
          )}

          {isConferenceProceedingsType && (
            <InputField
              label={t("publication.publisher")}
              id={`publisher-${index}`}
              name={`publisher-${index}`}
              type="text"
              value={publication.publisher || ""}
              onChange={(value) => updatePublicationField("publisher", value)}
              readOnly={readOnly}
            />
          )}
        </div>
      </div>

      {!readOnly && (
        <div className="flex items-center justify-end gap-x-2">
          <button
            onClick={handleClearFields}
            type="button"
            className="rounded-md bg-patras-cameo px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("common.clear")}
          </button>
          <button
            onClick={handleDelete}
            type="button"
            className="rounded-md bg-patras-sanguineBrown px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("common.delete")}
          </button>
        </div>
      )}
    </div>
  );
}
