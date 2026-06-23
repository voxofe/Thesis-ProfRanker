import React from "react";
import InputField from "../components/InputField";
import CustomSelect from "../components/CustomSelect";

export default function CoursePanel({
  courses,
  onCourseChange,
  onAddCourse,
  onRemoveCourse,
  showAddButton = false,
  disabled,
  scientificFieldValue, // New prop to check the scientific field value
  errors = {},
}) {
  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const handlePositiveNumberChange = (idx, field, value) => {
    if (value === "") {
      onCourseChange(idx, field, "");
      return;
    }
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return;
    onCourseChange(idx, field, n);
  };

  const handleNonNegativeNumberChange = (idx, field, value) => {
    if (value === "") {
      onCourseChange(idx, field, "");
      return;
    }
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return;
    onCourseChange(idx, field, n);
  };
  const handleClearFields = (index) => {
    const fields = [
      "name",
      "code",
      "semester",
      "category",
      "ects",
      "teaching_units",
      "theory_hours",
      "lab_hours",
      "description",
    ];
    fields.forEach((f) => onCourseChange(index, f, ""));
  };

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-700 dark:text-[var(--color-text-secondary)] mb-4 border-b pb-1">
        Μαθήματα
      </h2>

      <div className="space-y-3">
        {courses.length === 0 ? ( // Check if there are no courses
          scientificFieldValue === "select" ? ( // Check if scientific field is "select"
            <div className="text-center text-gray-500 dark:text-[var(--color-text-muted)] py-8">
              <p>Επιλέξτε επιστημονικό πεδίο για να δείτε τα διαθέσιμα μαθήματα.</p>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-[var(--color-text-muted)] py-8">
              <p>Δεν έχετε προσθέσει ακόμη κάποιο μάθημα.</p>
              <p className="text-sm mt-2">
                Χρησιμοποιήστε το κουμπί παρακάτω για να προσθέσετε ένα.
              </p>
            </div>
          )
        ) : (
          courses.map((c, idx) => (
            <div
              key={idx}
              className={`pr-publication-card bg-patras-albescentWhite/20 px-5 pt-8 pb-5 rounded-xl border mb-4 shadow-sm relative ${
                disabled ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="pr-publication-number" aria-hidden="true">
                <span>{idx + 1}</span>
              </div>
              {(() => {
                const ectsValue = toNumberOrNull(c.ects);
                const teachingUnitsValue = toNumberOrNull(c.teaching_units);
                const theoryHoursValue = toNumberOrNull(c.theory_hours);
                const labHoursValue = toNumberOrNull(c.lab_hours);

                const ectsError =
                  ectsValue !== null && ectsValue <= 0
                    ? "Τα ECTS πρέπει να είναι μεγαλύτερα από 0."
                    : null;
                const teachingUnitsError =
                  teachingUnitsValue !== null && teachingUnitsValue <= 0
                    ? "Οι διδακτικές μονάδες πρέπει να είναι μεγαλύτερες από 0."
                    : null;
                const theoryHoursError =
                  theoryHoursValue !== null && theoryHoursValue < 0
                    ? "Οι ώρες θεωρίας δεν μπορούν να είναι αρνητικές."
                    : null;
                const labHoursError =
                  labHoursValue !== null && labHoursValue < 0
                    ? "Οι ώρες εργαστηρίου δεν μπορούν να είναι αρνητικές."
                    : null;
                const hoursError =
                  theoryHoursValue !== null &&
                  labHoursValue !== null &&
                  theoryHoursValue === 0 &&
                  labHoursValue === 0
                    ? "Οι ώρες θεωρίας και εργαστηρίου δεν μπορούν να είναι ταυτόχρονα 0."
                    : null;

                return (
                  <>
              {/* Name + Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <InputField
                    label="Όνομα μαθήματος"
                    value={c.name}
                    onChange={(val) => onCourseChange(idx, "name", val)}
                    required
                    disabled={disabled} // Pass disabled prop
                  />
                </div>
                <div className="md:col-span-1">
                  <InputField
                    label="Κωδικός μαθήματος"
                    value={c.code}
                    onChange={(val) => onCourseChange(idx, "code", val)}
                    required
                    disabled={disabled} // Pass disabled prop
                  />
                </div>
              </div>

              {/* Row 2: Semester, Category, ECTS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <CustomSelect
                  label="Εξάμηνο"
                  value={c.semester}
                  onChange={(val) => onCourseChange(idx, "semester", val)}
                  options={[
                    { value: "Χειμερινό", label: "Χειμερινό" },
                    { value: "Εαρινό", label: "Εαρινό" },
                  ]}
                  required
                  disabled={disabled} // Pass disabled prop
                />
                <CustomSelect
                  label="Κατηγορία"
                  value={c.category}
                  onChange={(val) => onCourseChange(idx, "category", val)}
                  options={[
                    { value: "Υποχρεωτικό", label: "Υποχρεωτικό" },
                    { value: "Επιλογής", label: "Επιλογής" },
                  ]}
                  required
                  disabled={disabled} // Pass disabled prop
                />
                <InputField
                  label="ECTS"
                  type="number"
                  min="1"
                  value={c.ects}
                  onChange={(val) => handlePositiveNumberChange(idx, "ects", val)}
                  required
                  disabled={disabled} // Pass disabled prop
                  error={ectsError}
                />
              </div>

              {/* Row 3: Teaching Units, Theory Hours, Lab Hours */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <InputField
                  label="Διδακτικές μονάδες"
                  type="number"
                  min="1"
                  value={c.teaching_units}
                  onChange={(val) => handlePositiveNumberChange(idx, "teaching_units", val)}
                  required
                  disabled={disabled} // Pass disabled prop
                  error={teachingUnitsError}
                />
                <InputField
                  label="Ώρες θεωρίας"
                  type="number"
                  min="0"
                  value={c.theory_hours}
                  onChange={(val) => handleNonNegativeNumberChange(idx, "theory_hours", val)}
                  required
                  disabled={disabled} // Pass disabled prop
                  error={theoryHoursError}
                />
                <InputField
                  label="Ώρες εργαστηρίου"
                  type="number"
                  min="0"
                  value={c.lab_hours}
                  onChange={(val) => handleNonNegativeNumberChange(idx, "lab_hours", val)}
                  required
                  disabled={disabled} // Pass disabled prop
                  error={labHoursError}
                />
              </div>

              {hoursError && (
                <p className="-mt-2 mb-3 text-sm text-red-600">{hoursError}</p>
              )}

              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-medium pb-2 text-gray-900 dark:text-[var(--color-text-primary)] mb-1">
                  Περιγραφή <span className="text-red-500">*</span>
                </label>
                <textarea
                  ref={(el) => {
                    if (el) {
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }
                  }}
                  className="block w-full rounded-md bg-white dark:bg-[var(--color-bg-card)] text-gray-900 dark:text-[var(--color-text-primary)] px-3 py-1.5 text-base placeholder:text-gray-400 dark:text-[var(--color-text-muted)] 
                  outline outline-1 -outline-offset-1 outline-patras-buccaneer 
                  focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-patras-buccaneer 
                  focus:ring-0 sm:text-sm/6"
                  style={{ minHeight: "100px", resize: "vertical" }}
                  value={c.description}
                  onChange={(e) =>
                    onCourseChange(idx, "description", e.target.value)
                  }
                  placeholder="Περιγραφή μαθήματος..."
                  required
                  disabled={disabled}
                />
                {errors[`course${idx}_description`] && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors[`course${idx}_description`]}
                  </p>
                )}
              </div>

              {/* Clear and Delete Buttons */}
              <div className="flex items-center justify-end gap-x-2 mt-4">
                <button
                  onClick={() => handleClearFields(idx)}
                  type="button"
                  className="rounded-md bg-patras-cameo px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  disabled={disabled} // Disable button if disabled
                >
                  Καθαρισμός
                </button>
                <button
                  onClick={() => onRemoveCourse(idx)}
                  type="button"
                  className="rounded-md bg-patras-sanguineBrown px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  disabled={disabled} // Disable button if disabled
                >
                  Διαγραφή
                </button>
              </div>
                  </>
                );
              })()}
            </div>
          ))
        )}
      </div>

      {showAddButton && (
        <button
          type="button"
          className="rounded-md bg-patras-buccaneer px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 mt-3"
          onClick={onAddCourse}
          disabled={disabled} // Disable button if disabled
        >
          + Προσθήκη μαθήματος
        </button>
      )}
    </section>
  );
}
