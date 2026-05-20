import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

const CreatePositionValidationContext = createContext();

export const useCreatePositionValidation = () =>
  useContext(CreatePositionValidationContext);

export const CreatePositionValidationProvider = ({ children }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  // PURE calculator — stable identity
  const computeErrors = useCallback((formData, mode) => {
    const errors = {};

    if (mode === "position") {
      if (!formData.scientificFieldId) errors.scientificFieldId = "Απαιτείται επιλογή επιστημονικού πεδίου.";
      if (!formData.startDate) errors.startDate = "Η ημερομηνία έναρξης είναι υποχρεωτική.";
      if (!formData.endDate) errors.endDate = "Η ημερομηνία λήξης είναι υποχρεωτική.";
      if (!formData.startTime) errors.startTime = "Η ώρα έναρξης είναι υποχρεωτική.";
      if (!formData.endTime) errors.endTime = "Η ώρα λήξης είναι υποχρεωτική.";

      if (formData.startDate && formData.startTime) {
        const start = new Date(`${formData.startDate}T${formData.startTime}`);
        const now = new Date();
        if (!isNaN(start) && start < now) {
          errors.startDate = "Η ημερομηνία/ώρα έναρξης πρέπει να είναι μελλοντική.";
        }
      }

      if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
        const start = new Date(`${formData.startDate}T${formData.startTime}`);
        const end = new Date(`${formData.endDate}T${formData.endTime}`);
        if (!isNaN(start) && !isNaN(end) && end <= start) {
          errors.endDate = "Η ημερομηνία/ώρα λήξης πρέπει να είναι μετά την ημερομηνία/ώρα έναρξης.";
          errors.dateTimeRange = "Η λήξη πρέπει να είναι αυστηρά μετά την έναρξη (ημερομηνία και ώρα).";
        }
      }
    }

    if (mode === "scientificField") {
      if (!formData.scientificField || formData.scientificField.trim() === "") {
        errors.scientificField = "Το επιστημονικό πεδίο είναι υποχρεωτικό.";
      }
      if (!formData.school || formData.school === "select") errors.school = "Η σχολή είναι υποχρεωτική.";
      if (!formData.department || formData.department === "select") errors.department = "Το τμήμα είναι υποχρεωτικό.";

      const hasPositionFields =
        formData.startDate ||
        formData.endDate ||
        formData.startTime ||
        formData.endTime;

      if (hasPositionFields) {
        if (!formData.startDate) errors.startDate = "Η ημερομηνία έναρξης είναι υποχρεωτική.";
        if (!formData.endDate) errors.endDate = "Η ημερομηνία λήξης είναι υποχρεωτική.";
        if (!formData.startTime) errors.startTime = "Η ώρα έναρξης είναι υποχρεωτική.";
        if (!formData.endTime) errors.endTime = "Η ώρα λήξης είναι υποχρεωτική.";

        if (formData.startDate && formData.startTime) {
          const start = new Date(`${formData.startDate}T${formData.startTime}`);
          const now = new Date();
          if (!isNaN(start) && start < now) {
            errors.startDate = "Η ημερομηνία/ώρα έναρξης πρέπει να είναι μελλοντική.";
          }
        }

        if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
          const start = new Date(`${formData.startDate}T${formData.startTime}`);
          const end = new Date(`${formData.endDate}T${formData.endTime}`);
          if (!isNaN(start) && !isNaN(end) && end <= start) {
            errors.endDate = "Η ημερομηνία/ώρα λήξης πρέπει να είναι μετά την ημερομηνία/ώρα έναρξης.";
            errors.dateTimeRange = "Η λήξη πρέπει να είναι αυστηρά μετά την έναρξη (ημερομηνία και ώρα).";
          }
        }
      }

      if (!Array.isArray(formData.courses) || formData.courses.length === 0) {
        errors.courses = "Πρέπει να προσθέσετε τουλάχιστον ένα μάθημα.";
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
          if (missing.length) errors[`course${i}`] = `Το μάθημα #${i + 1} έχει κενά υποχρεωτικά πεδία.`;

          const ects = numOrNull(course.ects);
          if (ects !== null && ects <= 0) {
            errors[`course${i}_ects`] = "Τα ECTS πρέπει να είναι μεγαλύτερα από 0.";
          }

          const teachingUnits = numOrNull(course.teaching_units);
          if (teachingUnits !== null && teachingUnits <= 0) {
            errors[`course${i}_teaching_units`] = "Οι διδακτικές μονάδες πρέπει να είναι μεγαλύτερες από 0.";
          }

          const theoryHours = numOrNull(course.theory_hours);
          const labHours = numOrNull(course.lab_hours);

          if (theoryHours !== null && theoryHours < 0) {
            errors[`course${i}_theory_hours`] = "Οι ώρες θεωρίας δεν μπορούν να είναι αρνητικές.";
          }

          if (labHours !== null && labHours < 0) {
            errors[`course${i}_lab_hours`] = "Οι ώρες εργαστηρίου δεν μπορούν να είναι αρνητικές.";
          }

          if (theoryHours !== null && labHours !== null && theoryHours === 0 && labHours === 0) {
            errors[`course${i}_hours`] = "Οι ώρες θεωρίας και εργαστηρίου δεν μπορούν να είναι ταυτόχρονα 0.";
          }
        });
      }
    }

    return errors;
  }, []);

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
