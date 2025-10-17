import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

const CreatePositionValidationContext = createContext();

export const useCreatePositionValidation = () =>
  useContext(CreatePositionValidationContext);

export const CreatePositionValidationProvider = ({ children }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  // PURE calculator — stable identity
  const computeErrors = useCallback((formData, isNewSciField) => {
    const errors = {};

    // Scientific field
    if (isNewSciField) {
      if (!formData.newSciFieldName || formData.newSciFieldName.trim() === "") {
        errors.newSciFieldName = "New scientific field name is required.";
      }
    } else {
      if (!formData.scientificField || formData.scientificField === "select") {
        errors.scientificField = "Scientific field is required.";
      }
    }

    // Base fields
    if (!formData.school || formData.school === "select") errors.school = "School is required.";
    if (!formData.department || formData.department === "select") errors.department = "Department is required.";
    if (!formData.startDate) errors.startDate = "Start date is required.";
    if (!formData.endDate) errors.endDate = "End date is required.";

    // Courses (only when creating a new scientific field)
    if (isNewSciField) {
      if (!Array.isArray(formData.courses) || formData.courses.length === 0) {
        errors.courses = "At least one course is required.";
      } else {
        formData.courses.forEach((c, i) => {
          const required = [
            "code",
            "name",
            "semester",
            "category",
            "ects",
            "teaching_units",
            "theory_hours",
            "lab_hours",
          ];
          const missing = required.filter((k) => !c[k] || c[k] === "select");
          if (missing.length) errors[`course${i}`] = `Course #${i + 1} missing required fields.`;
        });
      }
    }

    return errors;
  }, []);

  // Stateful updater — stable identity
  const updateValidity = useCallback(
    (formData, isNewSciField) => {
      const errors = computeErrors(formData, isNewSciField);
      setValidationErrors(errors);
      setIsValid(Object.keys(errors).length === 0);
      return errors;
    },
    [computeErrors]
  );

  // Only validationErrors / isValid change between renders; functions stay stable
  const value = useMemo(
    () => ({ validationErrors, isValid, updateValidity, computeErrors }),
    [validationErrors, isValid, updateValidity, computeErrors]
  );

  return (
    <CreatePositionValidationContext.Provider value={value}>
      {children}
    </CreatePositionValidationContext.Provider>
  );
};
