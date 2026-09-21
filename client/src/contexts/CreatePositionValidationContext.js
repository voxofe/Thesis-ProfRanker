import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { useLanguage } from "./LanguageContext";

const CreatePositionValidationContext = createContext();

export const useCreatePositionValidation = () =>
  useContext(CreatePositionValidationContext);

export const CreatePositionValidationProvider = ({ children }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const { t } = useLanguage();

  // PURE calculator — stable identity
  const computeErrors = useCallback((formData, mode) => {
    const errors = {};

    if (mode === "position") {
      if (!formData.scientificFieldId) errors.scientificFieldId = t("positionValidation.scientificFieldIdRequired");
      if (!formData.startDate) errors.startDate = t("positionValidation.startDateRequired");
      if (!formData.endDate) errors.endDate = t("positionValidation.endDateRequired");
      if (!formData.startTime) errors.startTime = t("positionValidation.startTimeRequired");
      if (!formData.endTime) errors.endTime = t("positionValidation.endTimeRequired");

      if (formData.startDate && formData.startTime) {
        const start = new Date(`${formData.startDate}T${formData.startTime}`);
        const now = new Date();
        if (!isNaN(start) && start < now) {
          errors.startDate = t("positionValidation.startFuture");
        }
      }

      if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
        const start = new Date(`${formData.startDate}T${formData.startTime}`);
        const end = new Date(`${formData.endDate}T${formData.endTime}`);
        if (!isNaN(start) && !isNaN(end) && end <= start) {
          errors.endDate = t("positionValidation.endAfterStart");
          errors.dateTimeRange = t("positionValidation.dateTimeRange");
        }
      }
    }

    if (mode === "scientificField") {
      if (!formData.scientificField || formData.scientificField.trim() === "") {
        errors.scientificField = t("positionValidation.scientificFieldRequired");
      }
      if (!formData.school || formData.school === "select") errors.school = t("positionValidation.schoolRequired");
      if (!formData.department || formData.department === "select") errors.department = t("positionValidation.departmentRequired");

      const hasPositionFields =
        formData.startDate ||
        formData.endDate ||
        formData.startTime ||
        formData.endTime;

      if (hasPositionFields) {
        if (!formData.startDate) errors.startDate = t("positionValidation.startDateRequired");
        if (!formData.endDate) errors.endDate = t("positionValidation.endDateRequired");
        if (!formData.startTime) errors.startTime = t("positionValidation.startTimeRequired");
        if (!formData.endTime) errors.endTime = t("positionValidation.endTimeRequired");

        if (formData.startDate && formData.startTime) {
          const start = new Date(`${formData.startDate}T${formData.startTime}`);
          const now = new Date();
          if (!isNaN(start) && start < now) {
            errors.startDate = t("positionValidation.startFuture");
          }
        }

        if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
          const start = new Date(`${formData.startDate}T${formData.startTime}`);
          const end = new Date(`${formData.endDate}T${formData.endTime}`);
          if (!isNaN(start) && !isNaN(end) && end <= start) {
            errors.endDate = t("positionValidation.endAfterStart");
            errors.dateTimeRange = t("positionValidation.dateTimeRange");
          }
        }
      }

      if (!Array.isArray(formData.courses) || formData.courses.length === 0) {
        errors.courses = t("positionValidation.coursesRequired");
      } else {
        formData.courses.forEach((course, i) => {
          const numOrNull = (value) => {
            if (value === null || value === undefined || value === "") return null;
            const n = Number(value);
            return Number.isFinite(n) ? n : null;
          };

          const required = [
            "code",
            "name",
            "semester",
            "category",
            "ects",
            "teaching_units",
            "theory_hours",
            "lab_hours",
            "description"
          ];

          const isMissing = (field) => {
            const value = course[field];
            if (value === "select") return true;
            if (value === null || value === undefined || value === "") return true;
            return false;
          };

          const missing = required.filter((requiredField) => isMissing(requiredField));
          if (missing.length) errors[`course${i}`] = t("positionValidation.courseMissingFields", { index: i + 1 });

          const description = String(course.description || "");
          const descriptionCount = description.replace(/\s/g, "").length;
          const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
          if (
            (descriptionCount > 0 && descriptionCount < 120) ||
            (wordCount > 0 && wordCount < 20)
          ) {
            errors[`course${i}_description`] =
              t("positionValidation.courseDescription");
          }

          const ects = numOrNull(course.ects);
          if (ects !== null && ects <= 0) {
            errors[`course${i}_ects`] = t("positionValidation.courseEcts");
          }

          const teachingUnits = numOrNull(course.teaching_units);
          if (teachingUnits !== null && teachingUnits <= 0) {
            errors[`course${i}_teaching_units`] = t("positionValidation.courseTeachingUnits");
          }

          const theoryHours = numOrNull(course.theory_hours);
          const labHours = numOrNull(course.lab_hours);

          if (theoryHours !== null && theoryHours < 0) {
            errors[`course${i}_theory_hours`] = t("positionValidation.courseTheoryHours");
          }

          if (labHours !== null && labHours < 0) {
            errors[`course${i}_lab_hours`] = t("positionValidation.courseLabHours");
          }

          if (theoryHours !== null && labHours !== null && theoryHours === 0 && labHours === 0) {
            errors[`course${i}_hours`] = t("positionValidation.courseHours");
          }
        });
      }
    }

    return errors;
  }, [t]);

  // Stateful updater — stable identity
  const updateValidity = useCallback(
    (formData, mode) => {
      const errors = computeErrors(formData, mode);
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
