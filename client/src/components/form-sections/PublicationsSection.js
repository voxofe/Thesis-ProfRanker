import React from "react";
import { useFormData } from "../../contexts/FormDataContext.js";
import Publication from "../Publication.js";

export default function PublicationsSection({ readOnly = false }) {
  const { formData, handleChange } = useFormData();

  const addNewPublication = () => {
    if (readOnly) return;
    const newPublication = {
      type: "",
      publicationTitle: "",
      journalConfTitle: "",
      year: "",
      issn: "",
    };
    const updatedPublications = [...formData.publications, newPublication];
    handleChange("publications", updatedPublications);
  };

  return (
    <div className="overflow-hidden"> 
      <legend className="text-sm/6 font-semibold text-gray-900">
        Επιστημονικές δημοσιεύσεις
      </legend>
      <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-8 pt-1 pb-0 sm:pb-2"></div>
        <div className="grid grid-cols-1 pt-2 gap-y-3">
          {formData.publications.map((_, index) => (
            <Publication key={index} index={index} readOnly={readOnly} />
          ))}
          {formData.publications.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>Δεν έχετε προσθέσει ακόμη κάποια επιστημονική δημοσίευση.</p>
              <p className="text-sm mt-2">
                Χρησιμοποιήστε το κουμπί παρακάτω για να προσθέσετε μία.
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-x-6 pt-5 mt-3 sm:pt-0">
          <button
            onClick={addNewPublication}
            type="button"
            disabled={readOnly}
            className="rounded-md bg-patras-buccaneer px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            + Προσθήκη νέας
          </button>
        </div>
      </div>
    </div>
  );
}
