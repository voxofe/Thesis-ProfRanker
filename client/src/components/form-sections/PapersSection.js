import React from "react";
import { useFormData } from "../../contexts/FormDataContext.js";
import Paper from "../Paper.js";

export default function PaperSection() {
    const { formData, handleChange } = useFormData();

    const addNewPaper = () => {
        const newPaper = { type: "", paperTitle: "", journalConfTitle: "", year: "", issn: "" };
        const updatedPapers = [...formData.papers, newPaper];
        handleChange("papers", updatedPapers);
    };

    return (
        <div className="py-5 border-b border-gray-900/10">
            <legend className="text-sm/6 font-semibold text-gray-900">
                Ακαδημαϊκές Εργασίες (Δημοσιεύσεις / Ανακοινώσεις σε συνέδρια)
            </legend>
            <div className="">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-8 pt-1 pb-0 sm:pb-2 sm:border-b sm:border-gray-900/10">
                </div>
                <div className="grid grid-cols-1 pt-2 gap-y-3">
                    {formData.papers.map((_, index) => (
                        <div key={index}>
                            <Paper index={index} />
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-x-6 pt-5 mt-3 sm:pt-0">
                    <button
                        onClick={addNewPaper}
                        type="button"
                        className="rounded-md bg-patras-buccaneer px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        + Προσθήκη νέας
                    </button>
                </div>
            </div>
        </div>
    );
}
