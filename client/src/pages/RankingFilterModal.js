import React, { useEffect, useState } from "react";
import InputField from "../components/InputField";
import Checkbox from "../components/Checkbox";

export default function RankingFilterModal({
  open,
  onClose,
  filters,
  setFilters,
  options,
  isAdmin,
  onReset,
}) {
  // Local state for multi-selects
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const handleMultiSelect = (key, value) => {
    setLocalFilters((prev) => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const handleInput = (key, value) => {
    // For points inputs, clamp to allowed range (0-97) and normalize empty values
    if (key === "pointsMin" || key === "pointsMax") {
      if (value === "" || value === null || value === undefined) {
        setLocalFilters((prev) => ({ ...prev, [key]: "" }));
        return;
      }
      const num = Number(value);
      if (Number.isNaN(num)) {
        // ignore invalid input
        return;
      }
      const clamped = Math.max(0, Math.min(97, num));
      setLocalFilters((prev) => ({ ...prev, [key]: String(clamped) }));
      return;
    }

    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    // sanitize points before applying
    const sanitized = { ...localFilters };
    ["pointsMin", "pointsMax"].forEach((k) => {
      if (sanitized[k] === "" || sanitized[k] === null || sanitized[k] === undefined) {
        sanitized[k] = "";
        return;
      }
      const n = Number(sanitized[k]);
      if (Number.isNaN(n)) {
        sanitized[k] = "";
        return;
      }
      sanitized[k] = String(Math.max(0, Math.min(97, n)));
    });
    setFilters(sanitized);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
      schools: [],
      departments: [],
      scientificFields: [],
      status: [],
      pointsMin: "",
      pointsMax: "",
    });
    setFilters({
      schools: [],
      departments: [],
      scientificFields: [],
      status: [],
      pointsMin: "",
      pointsMax: "",
    });
    onReset?.();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg border w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-red-700 text-2xl"
          onClick={onClose}
          title="Κλείσιμο"
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold text-patras-buccaneer mb-4">
          Φίλτρα Κατάταξης
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* School */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Σχολή
            </label>
            <div className="flex flex-wrap gap-2">
              {options.schools.map((school) => (
                <button
                  key={school}
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs font-medium ${
                    localFilters.schools.includes(school)
                      ? "bg-patras-buccaneer text-white border-patras-buccaneer"
                      : "bg-white text-patras-buccaneer border-patras-buccaneer"
                  }`}
                  onClick={() => handleMultiSelect("schools", school)}
                >
                  {school}
                </button>
              ))}
            </div>
          </div>
          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Τμήμα
            </label>
            <div className="flex flex-wrap gap-2">
              {options.departments.map((dep) => (
                <button
                  key={dep}
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs font-medium ${
                    localFilters.departments.includes(dep)
                      ? "bg-patras-buccaneer text-white border-patras-buccaneer"
                      : "bg-white text-patras-buccaneer border-patras-buccaneer"
                  }`}
                  onClick={() => handleMultiSelect("departments", dep)}
                >
                  {dep}
                </button>
              ))}
            </div>
          </div>
          {/* Scientific Field */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Επιστημονικό Πεδίο
            </label>
            <div className="flex flex-wrap gap-2">
              {options.scientificFields.map((sf) => (
                <button
                  key={sf}
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs font-medium ${
                    localFilters.scientificFields.includes(sf)
                      ? "bg-patras-buccaneer text-white border-patras-buccaneer"
                      : "bg-white text-patras-buccaneer border-patras-buccaneer"
                  }`}
                  onClick={() => handleMultiSelect("scientificFields", sf)}
                >
                  {sf}
                </button>
              ))}
            </div>
          </div>
          {/* Status (admin only) */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Κατάσταση Αιτήσεων
              </label>
              <div className="flex flex-wrap gap-2">
                {options.statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`px-3 py-1 rounded-full border text-xs font-medium ${
                      localFilters.status.includes(status)
                        ? "bg-patras-buccaneer text-white border-patras-buccaneer"
                        : "bg-white text-patras-buccaneer border-patras-buccaneer"
                    }`}
                    onClick={() => handleMultiSelect("status", status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Points Range */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Εύρος Μορίων
            </label>
            <div className="flex gap-2 items-center">
              <InputField
                id="pointsMin"
                name="pointsMin"
                type="number"
                min={0}
                max={97}
                value={localFilters.pointsMin}
                onChange={(v) => handleInput("pointsMin", v)}
                onBlur={() => handleInput("pointsMin", localFilters.pointsMin)}
                style="w-24"
                placeholder="Ελάχιστο"
              />
              <span className="mx-2 text-gray-500">-</span>
              <InputField
                id="pointsMax"
                name="pointsMax"
                type="number"
                min={0}
                max={97}
                value={localFilters.pointsMax}
                onChange={(v) => handleInput("pointsMax", v)}
                onBlur={() => handleInput("pointsMax", localFilters.pointsMax)}
                style="w-24"
                placeholder="Μέγιστο"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            onClick={handleReset}
          >
            Καθαρισμός
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-patras-buccaneer text-white font-semibold hover:bg-patras-sanguineBrown"
            onClick={handleApply}
          >
            Εφαρμογή
          </button>
        </div>
      </div>
    </div>
  );
}