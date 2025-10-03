import React, { createContext, useContext, useState, useEffect } from "react";
import { useFormData } from "./FormDataContext";

const ValidationContext = createContext();

export const useValidation = () => useContext(ValidationContext);

export const ValidationProvider = ({ children }) => {
  const { formData } = useFormData();
  const [stepValidation, setStepValidation] = useState({
    1: false, // Personal Info
    2: false, // Scientific Field
    3: false, // Course Plan (empty step)
    4: false, // PhD
    5: true, // Papers
    6: false, // Final Info
  });

  // Update validation whenever formData changes
  useEffect(() => {
    const validatePersonalInfo = () => {
      return !!(
        formData.firstName?.trim() &&
        formData.lastName?.trim() &&
        formData.email?.trim() &&
        formData.cvDocument
      );
    };

    const validatePhd = () => {
      const basicValid = !!(
        formData.phdDocument &&
        formData.phdTitle?.trim() &&
        formData.phdAcquisitionDate
      );

      // If foreign institute is checked, DOATAP document is required
      if (formData.phdIsFromForeignInstitute) {
        return basicValid && !!formData.doatapDocument;
      }

      return basicValid;
    };

    const validatePapers = () => {
      // Papers are optional, but if any paper exists, it must be complete
      if (formData.papers.length === 0) {
        return true; // No papers is valid
      }

      // Check if all papers are complete
      const allPapersComplete = formData.papers.every((paper) => {
        const hasType = paper.type?.trim();
        const hasTitle = paper.paperTitle?.trim();
        const hasYear = paper.year?.trim();

        if (!hasType || !hasTitle || !hasYear) {
          return false;
        }

        // For journal type, ISSN and journal title are required
        if (paper.type === "journal") {
          return paper.issn?.trim() && paper.journalConfTitle?.trim();
        }

        // For conference type, conference title is required
        if (paper.type === "conference") {
          return paper.journalConfTitle?.trim();
        }

        // For other types, only title and year are required
        return true;
      });

      return allPapersComplete;
    };

    const validateScientificField = () => {
      return !!formData.positionId;
    };

    const validateCoursePlan = () => {
      return true; // Not yet implemented
    };

    const validateFinalInfo = () => {
      return !!(
        formData.workExperience !== null &&
        formData.workExperience >= 0 &&
        formData.workExperience <= 14 &&
        formData.militaryObligationsDocument
      );
    };

    setStepValidation({
      1: validatePersonalInfo(),
      2: validateScientificField(),
      3: validateCoursePlan(),
      4: validatePhd(),
      5: validatePapers(),
      6: validateFinalInfo(),
    });
  }, [formData]);

  // Check if a step can be accessed
  const canAccessStep = (stepNumber) => {
    // Always allow access to step 1
    if (stepNumber === 1) return true;

    // For other steps, all previous steps must be valid
    for (let i = 1; i < stepNumber; i++) {
      if (!stepValidation[i]) return false;
    }
    return true;
  };

  // Check if can proceed to next step
  const canProceedFromStep = (stepNumber) => {
    return stepValidation[stepNumber] || false;
  };

  return (
    <ValidationContext.Provider
      value={{
        stepValidation,
        canAccessStep,
        canProceedFromStep,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
};
