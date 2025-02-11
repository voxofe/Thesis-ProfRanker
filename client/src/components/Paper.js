import React, { useState, useEffect } from "react";
import { useFormData } from "../contexts/FormDataContext";
import InputField from "./InputField";
// import countries from "../assets/data/countries";

export default function Paper({ index }) {

    const lastYear = 2021;
    const scimagoYears = Array.from({ length: lastYear - 1999 + 1 }, (_, i) => {
        const year = (1999 + i).toString();
        return { label: year, value: year };
    });

    const { formData, handleChange } = useFormData();
    const paper = formData.papers[index];

    const [type, setType] = useState(paper?.type || "");
    const [paperTitle, setPaperTitle] = useState(paper?.paperTitle || "");
    const [journalConfTitle, setJournalConfTitle] = useState(paper?.journalConfTitle || "");
    const [year, setYear] = useState(paper?.year || "");
    const [issn, setIssn] = useState(paper?.issn || "");

    const isJournalType = type === "journal";
    const isConferenceType = type === "conference";
    const isOtherType = type === "other" || type === "";

    useEffect(() => {
        const updatedPapers = [...formData.papers];
        updatedPapers[index] = { ...updatedPapers[index], type, paperTitle, journalConfTitle, year, issn };

        if (isOtherType) {
            updatedPapers[index].issn = "";
            updatedPapers[index].country = "";
            updatedPapers[index].journalConfTitle = "";
        } else if (isConferenceType) {
            updatedPapers[index].issn = "";
            updatedPapers[index].country = "";
        }

        handleChange("papers", updatedPapers);
    }, [type, paperTitle, journalConfTitle, year, issn]);

    const handleDelete = () => {
        const updatedPapers = formData.papers.filter((_, i) => i !== index);
        handleChange("papers", updatedPapers);
    };

    const handleClearFields = () => {
        setType("");
        setPaperTitle("");
        setJournalConfTitle("");
        setYear("");
        setIssn("");
    };

    return (
        <div className="grid sm:flex sm:flex-col gap-x-8 rounded-md border border-patras-cameo bg-patras-albescentWhite px-4 pt-2 pb-5 relative">
            <div className="sm:grid sm:grid-cols-2 gap-x-8">
                <div className="sm:flex sm:flex-row sm:justify-start sm:gap-x-8">
                    <InputField
                        label="Είδος"
                        id={`paper-type-${index}`}
                        name={`paper-type-${index}`}
                        optns={[
                            { label: "Δημοσίευση σε επιστημονικό περιοδικό", value: "journal" },
                            { label: "Ανακοίνωση σε συνέδριο", value: "conference" },
                            { label: "Άλλο είδος εργασίας", value: "other" }
                        ]}
                        isDropdown={true}
                        value={type}
                        onChange={(value) => setType(value)}
                        style={`sm:w-[80%]`}
                    />
                    <InputField
                        label="Έτος"
                        id={`year-${index}`}
                        name={`year-${index}`}
                        optns={scimagoYears}
                        isDropdown={true}
                        value={year}
                        onChange={(value) => setYear(value)}
                        style={`sm:w-[20%]`}
                    />
                </div>
                <InputField
                    label="Τίτλος Εργασίας"
                    id={`paper-title-${index}`}
                    name={`paper-title-${index}`}
                    type="text"
                    value={paperTitle}
                    onChange={(value) => setPaperTitle(value)}
                />
            </div>

            <div className="sm:grid sm:grid-cols-2 gap-x-8">
                <InputField
                    label={isOtherType ? "Τίτλος περιοδικού / συνεδρίου" : isConferenceType ? "Τίτλος συνεδρίου" : "Τίτλος περιοδικού"}
                    id={`journal/conference-${index}`}
                    name={`journal/conference-${index}`}
                    type="text"
                    value={journalConfTitle}
                    onChange={(value) => setJournalConfTitle(value)}
                    disabled={isOtherType}
                />
                <div className="sm:grid sm:grid-cols-1 gap-x-8">
                    <InputField
                        label="ISSN περιοδικού"
                        id={`issn-${index}`}
                        name={`issn-${index}`}
                        type="text"
                        value={issn}
                        onChange={(value) => setIssn(value)}
                        disabled={!isJournalType}
                    />
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
