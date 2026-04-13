import React, { createContext, useContext, useState, useEffect } from "react";
import { useFormData } from "./FormDataContext";
import { useAuth } from "./AuthContext";

const ValidationContext = createContext();

export const useValidation = () => useContext(ValidationContext);

export const ValidationProvider = ({ children }) => {
  const { formData } = useFormData();
  const { currentUser } = useAuth();
  const [stepValidation, setStepValidation] = useState({
    1: false, // Personal Info
    2: false, // Bio
    3: false, // Scientific Field
    4: true,  // Course Plan
    5: false, // PhD
    6: true,  // Papers
    7: false, // Work Experience
    8: false, // Documents / Declarations
  });

  // Update validation whenever formData changes
  useEffect(() => {
    const validatePersonalInfo = () => {
      return !!(
        formData.firstName?.trim() &&
        formData.lastName?.trim() &&
        formData.email?.trim() &&
        formData.phoneNumber?.trim() &&
        formData.streetAddress?.trim() &&
        formData.city?.trim() &&
        formData.postalCode?.trim()
      );
    };

    const validateBio = () => {
      return !!formData.cvDocument;
    };

    const validateScientificField = () => {
      return !!formData.positionId;
    };

    const validateCoursePlan = () => {
      return true; // Not yet implemented
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


    const validateWorkExperience = () => {
      const workExperienceValue = formData.workExperience;
      const hasWorkExperience =
        workExperienceValue !== "" &&
        workExperienceValue !== null &&
        workExperienceValue !== undefined;

      const workExperienceNumber = Number(workExperienceValue);
      const workExperienceValid =
        Number.isFinite(workExperienceNumber) &&
        workExperienceNumber >= 0 &&
        workExperienceNumber <= 10;

      return !!(
        hasWorkExperience &&
        workExperienceValid &&
        formData.employmentCertificateDocument
      );
    };

    const validateDocuments = () => {
      const requiresMilitaryDoc = currentUser?.gender === "male";
      const requiresPublicEmployeeDoc = formData.isPublicEmployee;
      const requiresNotParticipatedDoc = formData.hasNotParticipatedInPastProgram;

      return !!(
        formData.responsibleDeclarationDocument &&
        (!requiresMilitaryDoc || formData.militaryObligationsDocument) &&
        (!requiresPublicEmployeeDoc || formData.publicEmployeePermissionDocument) &&
        (!requiresNotParticipatedDoc || formData.notParticipatedDeclarationDocument)
      );
    };

    setStepValidation({
      1: validatePersonalInfo(),
      2: validateBio(),
      3: validateScientificField(),
      4: validateCoursePlan(),
      5: validatePhd(),
      6: validatePapers(),
      7: validateWorkExperience(),
      8: validateDocuments(),
    });
  }, [formData, currentUser?.gender]);

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
