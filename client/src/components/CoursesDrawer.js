import React, { useState } from "react";
import CourseDescriptionModal from "./CourseDescriptionModal";
import useBodyScrollLock from "../utils/useBodyScrollLock";

export default function CoursesDrawer({ courses = [], scientificField }) {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);

  const [descriptionModal, setDescriptionModal] = useState({
    open: false,
    title: "",
    description: "",
  });
  const handleClose = () => {
    setOpen(false);
    setDescriptionModal({
      open: false,
      title: "",
      description: "",
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors"
      >
        Προβολή
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 dark:bg-[var(--color-bg-overlay)]"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-5xl max-h-[80vh] overflow-auto bg-white rounded-lg shadow-lg border dark:bg-[var(--color-bg-card)] dark:border-[var(--color-border)] dark:shadow-[0_20px_45px_var(--color-shadow-strong)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-[var(--color-border-soft)]">
              <h4 className="text-lg font-semibold text-blackr dark:text-[var(--color-text-primary)]">
                Μαθήματα επιστημονικού πεδίου:{" "}
                <span className="text-patras-buccaneer font-semibold dark:text-[var(--color-primary)]">
                  {scientificField ?? ""}
                </span>
              </h4>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-600 hover:text-gray-800 text-2xl leading-none px-2 dark:text-[var(--color-text-muted)] dark:hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-patras-buccaneer dark:focus-visible:ring-[var(--color-primary)]"
                aria-label="Κλείσιμο"
                title="Κλείσιμο"
              >
                &times;
              </button>
            </div>

            <div className="p-4">
              {courses?.length ? (
                <div className="w-full overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded-lg bg-white dark:bg-[var(--color-bg-card)] dark:border-[var(--color-border)]">
                    <thead>
                      <tr className="bg-gray-100 text-xs text-gray-700 dark:bg-[var(--color-bg-surface)] dark:text-[var(--color-text-secondary)]">
                        <th className="px-2 py-2 border dark:border-[var(--color-border)]">Κωδικός</th>
                        <th className="px-2 py-2 border dark:border-[var(--color-border)]">Όνομα</th>
                        <th className="px-2 py-2 border dark:border-[var(--color-border)]">Περιγραφή</th>
                        <th className="px-2 py-2 border dark:border-[var(--color-border)]">Εξάμηνο</th>
                        <th className="px-2 py-2 border dark:border-[var(--color-border)]">Διδακτικές μονάδες</th>
                        <th className="px-2 py-2 border dark:border-[var(--color-border)]">ECTS</th>
                        <th className="px-2 py-2 border dark:border-[var(--color-border)]">Θεωρία (Ώρες)</th>
                        <th className="px-2 py-2 border dark:border-[var(--color-border)]">Εργαστήριο (Ώρες)</th>
                        <th className="px-2 py-2 border dark:border-[var(--color-border)]">Κατηγορία</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c) => (
                        <tr key={c.id} className="text-sm text-gray-800 text-center dark:text-[var(--color-text-secondary)]">
                          <td className="px-2 py-2 border dark:border-[var(--color-border)]">{c.code}</td>
                          <td className="px-2 py-2 border dark:border-[var(--color-border)]">{c.name}</td>
                          <td className="px-2 py-2 border dark:border-[var(--color-border)]">
                            <button
                              type="button"
                              onClick={() =>
                                setDescriptionModal({
                                  open: true,
                                  title: c.name ? `Περιγραφή μαθήματος: ${c.name}` : "Περιγραφή μαθήματος",
                                  description: c.description,
                                })
                              }
                              className="underline text-patras-buccaneer hover:text-patras-sanguineBrown dark:text-[var(--color-primary)] dark:hover:text-[var(--color-primary-hover)]"
                            >
                              Περιγραφή
                            </button>
                          </td>
                          <td className="px-2 py-2 border dark:border-[var(--color-border)]">{c.semester}</td>
                          <td className="px-2 py-2 border dark:border-[var(--color-border)]">{c.teachingUnits}</td>
                          <td className="px-2 py-2 border dark:border-[var(--color-border)]">{c.ects}</td>
                          <td className="px-2 py-2 border dark:border-[var(--color-border)]">{c.theory_hours}</td>
                          <td className="px-2 py-2 border dark:border-[var(--color-border)]">{c.lab_hours}</td>
                          <td className="px-2 py-2 border dark:border-[var(--color-border)]">{c.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-[var(--color-text-muted)]">Δεν υπάρχουν διαθέσιμα μαθήματα.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <CourseDescriptionModal
        open={descriptionModal.open}
        title={descriptionModal.title}
        description={descriptionModal.description}
        onClose={() =>
          setDescriptionModal({
            open: false,
            title: "",
            description: "",
          })
        }
      />
    </>
  );
}