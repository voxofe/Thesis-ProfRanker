import React, { useState } from "react";
import CourseDescriptionModal from "./CourseDescriptionModal";

export default function CoursesDrawer({ courses = [], scientificField }) {
  const [open, setOpen] = useState(false);
  const [descriptionModal, setDescriptionModal] = useState({
    open: false,
    title: "",
    description: "",
  });

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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl max-h-[80vh] overflow-auto bg-white rounded-lg shadow-lg border">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="text-lg font-semibold text-blackr">
                Μαθήματα επιστημονικού πεδίου:{" "}
                <span className="text-patras-buccaneer font-semibold">
                  {scientificField ?? ""}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setDescriptionModal({
                    open: false,
                    title: "",
                    description: "",
                  });
                }}
                className="text-gray-600 hover:text-gray-800 text-2xl leading-none px-2"
                aria-label="Κλείσιμο"
                title="Κλείσιμο"
              >
                &times;
              </button>
            </div>

            <div className="p-4">
              {courses?.length ? (
                <div className="w-full overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                    <thead>
                      <tr className="bg-gray-100 text-xs text-gray-700">
                        <th className="px-2 py-2 border">Κωδικός</th>
                        <th className="px-2 py-2 border">Όνομα</th>
                        <th className="px-2 py-2 border">Περιγραφή</th>
                        <th className="px-2 py-2 border">Εξάμηνο</th>
                        <th className="px-2 py-2 border">Διδακτικές μονάδες</th>
                        <th className="px-2 py-2 border">ECTS</th>
                        <th className="px-2 py-2 border">Θεωρία (Ώρες)</th>
                        <th className="px-2 py-2 border">Εργαστήριο (Ώρες)</th>
                        <th className="px-2 py-2 border">Κατηγορία</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c) => (
                        <tr key={c.id} className="text-sm text-gray-800 text-center">
                          <td className="px-2 py-2 border">{c.code}</td>
                          <td className="px-2 py-2 border">{c.name}</td>
                          <td className="px-2 py-2 border">
                            <button
                              type="button"
                              onClick={() =>
                                setDescriptionModal({
                                  open: true,
                                  title: c.name ? `Περιγραφή μαθήματος: ${c.name}` : "Περιγραφή μαθήματος",
                                  description: c.description,
                                })
                              }
                              className="underline text-patras-buccaneer hover:text-patras-sanguineBrown"
                            >
                              Περιγραφή
                            </button>
                          </td>
                          <td className="px-2 py-2 border">{c.semester}</td>
                          <td className="px-2 py-2 border">{c.teachingUnits}</td>
                          <td className="px-2 py-2 border">{c.ects}</td>
                          <td className="px-2 py-2 border">{c.theory_hours}</td>
                          <td className="px-2 py-2 border">{c.lab_hours}</td>
                          <td className="px-2 py-2 border">{c.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">Δεν υπάρχουν διαθέσιμα μαθήματα.</p>
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