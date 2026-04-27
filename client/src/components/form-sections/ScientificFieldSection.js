import React, { useEffect, useMemo } from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { usePositions } from "../../contexts/PositionsContext";
import TooltipGray from "../TooltipGray";
import PositionSelect from "../PositionSelect";

export default function ScientificFieldSection() {
  const { formData, handleChange, formMode, appliedPositionIds } = useFormData();
  const { positions, loading } = usePositions();

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
    <div className="space-y-6">
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

      <div className="mb-4 rounded-lg border border-patras-albescentWhite/60 bg-patras-albescentWhite/30 px-4 py-3 text-sm text-patras-buccaneer">
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

      <label className="block text-sm font-medium mb-1">
        Μαθήματα Επιστημονικού πεδίου:{" "}
        <span className="text-patras-buccaneer">
          {selectedPosition?.scientificField ?? ""}
        </span>
      </label>

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
            {selectedPosition && selectedPosition.courses?.length > 0 ? (
              selectedPosition.courses.map((course) => (
                <tr key={course.id} className="text-sm text-gray-800 text-center">
                  <td className="px-2 py-2 border">{course.code}</td>
                  <td className="px-2 py-2 border">{course.name}</td>
                  <td className="px-2 py-2 border">
                    <TooltipGray content={course.description}>
                      <span className="underline cursor-pointer text-patras-buccaneer">Περιγραφή</span>
                    </TooltipGray>
                  </td>
                  <td className="px-2 py-2 border">{course.semester}</td>
                  <td className="px-2 py-2 border">{course.teachingUnits}</td>
                  <td className="px-2 py-2 border">{course.ects}</td>
                  <td className="px-2 py-2 border">{course.theory_hours}</td>
                  <td className="px-2 py-2 border">{course.lab_hours}</td>
                  <td className="px-2 py-2 border">{course.category}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-6">
                  Επιλέξτε Θέση για να δείτε τα διαθέσιμα μαθήματα
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
