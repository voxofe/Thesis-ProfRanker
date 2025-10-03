import React, { useEffect, useMemo } from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { usePositions } from "../../contexts/PositionsContext";
import Tooltip from "../Tooltip.jsx";
import PositionSelect from "../PositionSelect";

export default function ScientificFieldSection() {
  const { formData, handleChange } = useFormData();
  const { positions, loading } = usePositions();

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
    const today = new Date();
    const todayYMD = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return (positions || []).filter((p) => {
      if (typeof p?.isActive === "boolean") return p.isActive;
      // Fallback if backend older and doesn't send isActive
      if (!p?.startDate || !p?.endDate) return false;
      const s = new Date(p.startDate);
      const e = new Date(p.endDate);
      if (isNaN(s) || isNaN(e)) return false;
      return s <= todayYMD && e >= todayYMD;
    });
  }, [positions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-8 h-auto mb-2">
        <PositionSelect
          positions={activePositions}
          value={formData.positionId}
          onChange={(posId) => handleChange("positionId", posId)}
          label="Θέση ( Σχολή - Τμήμα - Επιστημονικό Πεδίο )"
          disabled={loading || activePositions.length === 0}
          maxResults={50}
          required={true}
        />
      </div>

      {/* Optional chips summary ... */}

      <label className="block text-sm font-medium mb-1">
        Μαθήματα Επιστημονικού Πεδίου:{" "}
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
              <th className="px-2 py-2 border">Διδακτικές Μονάδες</th>
              <th className="px-2 py-2 border">ECTS</th>
              <th className="px-2 py-2 border">Θεωρία</th>
              <th className="px-2 py-2 border">Εργαστήριο</th>
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
                    <Tooltip content={course.description}>
                      <span className="underline cursor-pointer text-patras-buccaneer">Περιγραφή</span>
                    </Tooltip>
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
