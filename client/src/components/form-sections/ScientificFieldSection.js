import React, { useEffect, useMemo, useState } from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { usePositions } from "../../contexts/PositionsContext";
import TooltipGray from "../TooltipGray";
import CourseDescriptionModal from "../CourseDescriptionModal";
import PositionSelect from "../PositionSelect";

export default function ScientificFieldSection() {
  const { formData, handleChange, formMode, appliedPositionIds } = useFormData();
  const { positions, loading } = usePositions();
  const [descriptionModal, setDescriptionModal] = useState({
    open: false,
    title: "",
    description: "",
  });

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return "—";
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return dateStr;
    const [hh, mm] = (timeStr || "").split(":").map(Number);
    const dt = new Date(y, m - 1, d, hh || 0, mm || 0);
    if (isNaN(dt)) return dateStr;
    return new Intl.DateTimeFormat("el-GR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: timeStr ? "2-digit" : undefined,
      minute: timeStr ? "2-digit" : undefined,
      hour12: false,
    }).format(dt);
  };

  const selectedPosition = useMemo(
    () => positions.find((p) => String(p.id) === String(formData.positionId)) || null,
    [positions, formData.positionId]
  );

  useEffect(() => {
    if (selectedPosition) {
      if (formData.school !== selectedPosition.school) handleChange("school", selectedPosition.school);
      if (formData.department !== selectedPosition.department) handleChange("department", selectedPosition.department);
      if (formData.scientificField !== selectedPosition.scientificField)
        handleChange("scientificField", selectedPosition.scientificField);
    } else {
      if (formData.school) handleChange("school", "");
      if (formData.department) handleChange("department", "");
      if (formData.scientificField) handleChange("scientificField", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPosition]);

  // Keep only active positions for the selector
  const activePositions = useMemo(() => {
    const active = (positions || []).filter((p) => p?.state === "active");
    const appliedSet = new Set(appliedPositionIds || []);
    if (formMode !== "new") return active;
    return active.filter(
      (p) => !appliedSet.has(p.id) || String(p.id) === String(formData.positionId)
    );
  }, [positions, appliedPositionIds, formMode, formData.positionId]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-8 h-auto mb-0">
        <PositionSelect
          positions={activePositions}
          value={formData.positionId}
          onChange={(posId) => handleChange("positionId", posId)}
          label={
            formMode === "edit" ? (
              <TooltipGray content="Το επιστημονικό πεδίο δεν αλλάζει κατά την επανυποβολή.">
                <span className="underline cursor-help">Θέση ( Σχολή - Τμήμα - Επιστημονικό πεδίο )</span>
              </TooltipGray>
            ) : (
              "Θέση ( Σχολή - Τμήμα - Επιστημονικό πεδίο )"
            )
          }
          disabled={loading || activePositions.length === 0 || formMode === "edit"}
          maxResults={50}
          required={true}
        />
      </div>

      {/* Optional chips summary ... */}

      <div className=" rounded-lg border border-patras-albescentWhite/60 bg-patras-albescentWhite/30 px-4 py-3 text-sm text-patras-buccaneer dark:border-[var(--color-border)] dark:bg-[var(--color-bg-surface)] dark:text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-2">
          <span>Έναρξη αιτήσεων θέσης:</span>
          <span className="font-semibold">
            {formatDateTime(selectedPosition?.startDate, selectedPosition?.startTime)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span>Λήξη αιτήσεων θέσης:</span>
          <span className="font-semibold">
            {formatDateTime(selectedPosition?.endDate, selectedPosition?.endTime)}
          </span>
        </div>
      </div>

      <label className="block text-sm font-medium pt-5 mb-0 dark:text-[var(--color-text-primary)]">
        Μαθήματα επιστημονικού πεδίου:{" "}
        <span className="text-patras-buccaneer dark:text-[var(--color-primary)]">
          {selectedPosition?.scientificField ?? ""}
        </span>
      </label>

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
            {selectedPosition && selectedPosition.courses?.length > 0 ? (
              selectedPosition.courses.map((course) => (
                <tr key={course.id} className="text-sm text-gray-800 text-center dark:text-[var(--color-text-secondary)]">
                  <td className="px-2 py-2 border dark:border-[var(--color-border)]">{course.code}</td>
                  <td className="px-2 py-2 border dark:border-[var(--color-border)]">{course.name}</td>
                  <td className="px-2 py-2 border dark:border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={() =>
                        setDescriptionModal({
                          open: true,
                          title: course.name ? `Περιγραφή μαθήματος: ${course.name}` : "Περιγραφή μαθήματος",
                          description: course.description,
                        })
                      }
                      className="underline text-patras-buccaneer hover:text-patras-sanguineBrown dark:text-[var(--color-primary)] dark:hover:text-[var(--color-primary-hover)]"
                    >
                      Περιγραφή
                    </button>
                  </td>
                  <td className="px-2 py-2 border dark:border-[var(--color-border)]">{course.semester}</td>
                  <td className="px-2 py-2 border dark:border-[var(--color-border)]">{course.teachingUnits}</td>
                  <td className="px-2 py-2 border dark:border-[var(--color-border)]">{course.ects}</td>
                  <td className="px-2 py-2 border dark:border-[var(--color-border)]">{course.theory_hours}</td>
                  <td className="px-2 py-2 border dark:border-[var(--color-border)]">{course.lab_hours}</td>
                  <td className="px-2 py-2 border dark:border-[var(--color-border)]">{course.category}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-6 dark:text-[var(--color-text-muted)]">
                  Επιλέξτε θέση για να δείτε τα διαθέσιμα μαθήματα
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}
