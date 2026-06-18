import React, { createContext, useContext, useState, useEffect } from "react";
import { useFormData } from "./FormDataContext";
import { useAuth } from "./AuthContext";
import { usePositions } from "./PositionsContext";

const PHD_ABSTRACT_MIN_WORDS = 200;
const PHD_ABSTRACT_MAX_WORDS = 1000;
const PHD_KEYWORDS_MIN = 3;
const PHD_KEYWORDS_MAX = 10;

const ValidationContext = createContext();

export const useValidation = () => useContext(ValidationContext);

export const ValidationProvider = ({ children }) => {
  const { formData } = useFormData();
  const { currentUser } = useAuth();
  const { positions = [] } = usePositions();
  const [stepValidation, setStepValidation] = useState({
    1: false, // Personal Info
    2: false, // Scientific Field
    3: true, // Course Plan
    4: false, // Bio
    5: false, // PhD
    6: true, // Publications
    7: false, // Work Experience
    8: false, // Documents / Declarations
  });

  // Update validation whenever formData changes
  useEffect(() => {
    const normalizePhone = (value) => (value || "").replace(/[\s()-]/g, "");

    const validatePersonalInfo = () => {
      if (
        !formData.firstName?.trim() ||
        !formData.lastName?.trim() ||
        !formData.email?.trim() ||
        !formData.phoneNumber?.trim() ||
        !formData.streetAddress?.trim() ||
        !formData.city?.trim() ||
        !formData.postalCode?.trim()
      ) {
        return false;
      }

      const mobile = normalizePhone(formData.phoneNumber);
      if (!/^69\d{8}$/.test(mobile)) {
        return false;
      }

      if (formData.landlineNumber?.trim()) {
        const landline = normalizePhone(formData.landlineNumber);
        if (!/^2\d{9}$/.test(landline)) {
          return false;
        }
      }

      if (!/^\d{5}$/.test(formData.postalCode.trim())) {
        return false;
      }

      return true;
    };

    const validateBio = () => {
      const hasCv = !!formData.cvDocument;
      const hasBioSupportingDocs =
        Array.isArray(formData.bioSupportingDocuments) &&
        formData.bioSupportingDocuments.length > 0;

      return hasCv && hasBioSupportingDocs;
    };

    const validateScientificField = () => {
      return !!formData.positionId;
    };

    const validateCoursePlan = () => {
      const selectedPosition = positions.find(
        (position) => String(position.id) === String(formData.positionId)
      );
      if (!selectedPosition || !Array.isArray(selectedPosition.courses)) {
        return false;
      }

      if (selectedPosition.courses.length === 0) {
        return false;
      }

      const requiredFields = [
        "generalDescription",
        "learningObjectives",
        "deliveryMethods",
        "bibliographyMaterial",
        "learningOutcomes",
        "assessmentMethodsCriteria",
        ...Array.from({ length: 13 }, (_, index) => `courseScheduleWeek${index + 1}`),
      ];

      return selectedPosition.courses.every((course) => {
        const coursePlan = (formData.coursePlans || {})[String(course.id)] || {};
        return requiredFields.every((field) => {
          const value = coursePlan[field];
          return typeof value === "string" && value.trim().length > 0;
        });
      });
    };

    const validatePhd = () => {
      const basicValid = !!(
        formData.phdDocument &&
        formData.phdTitle?.trim() &&
        formData.phdAcquisitionDate
      );

      const abstractValue = (formData.phdAbstract || "").trim();
      const wordCount = abstractValue
        ? abstractValue.split(/\s+/).filter(Boolean).length
        : 0;
      const keywordsCount = Array.isArray(formData.phdKeywords)
        ? formData.phdKeywords.length
        : 0;
      const abstractValid =
        abstractValue &&
        wordCount >= PHD_ABSTRACT_MIN_WORDS &&
        wordCount <= PHD_ABSTRACT_MAX_WORDS;
      const keywordsValid =
        keywordsCount >= PHD_KEYWORDS_MIN && keywordsCount <= PHD_KEYWORDS_MAX;

      // If foreign institute is checked, DOATAP document is required
      if (formData.phdIsFromForeignInstitute) {
        return basicValid && abstractValid && keywordsValid && !!formData.doatapDocument;
      }
      return basicValid && abstractValid && keywordsValid;
    };

    const validatePublications = () => {
      // Publications are optional, but if any publication exists, it must be complete
      if (formData.publications.length === 0) {
        return true; // No publications is valid
      }

      // Check if all publications are complete
      const allPublicationsComplete = formData.publications.every((publication) => {
        const hasType = publication.type?.trim();
        const hasTitle = publication.publicationTitle?.trim();
        const hasYear = publication.year?.trim();
        const hasAuthors = Array.isArray(publication.authors)
          ? publication.authors.length > 0
          : !!publication.authors?.trim();

        if (!hasType || !hasTitle || !hasYear || !hasAuthors) {
          return false;
        }

        if (publication.type === "journal") {
          return publication.issn?.trim() && publication.journalConfTitle?.trim();
        }

        if (publication.type === "conference_proceedings") {
          return (
            publication.journalConfTitle?.trim() &&
            publication.publisher?.trim()
          );
        }

        if (publication.type === "conference_presentation") {
          return publication.journalConfTitle?.trim();
        }

        if (publication.type === "book" || publication.type === "monograph") {
          return publication.publisher?.trim();
        }

        return true;
      });

      return allPublicationsComplete;
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

        const hasEmploymentCertificates =
          (formData.employmentCertificates || []).length > 0;

        // If applicant declares 0 years, no certificates are required.
        if (hasWorkExperience && workExperienceValid && workExperienceNumber === 0) {
          return true;
        }

        return !!(
          hasWorkExperience &&
          workExperienceValid &&
          hasEmploymentCertificates
        );
      };

    const validateDocuments = () => {
      const requiresMilitaryDoc = currentUser?.gender === "male";
      const requiresPublicEmployeeDoc = formData.isPublicEmployee;
      const requiresNotParticipatedDoc = formData.hasNotParticipatedInPastProgram;
      const requiresEuCitizenDoc = formData.isEuCitizenNonGreek;

      return !!(
        formData.responsibleDeclarationDocument &&
        (!requiresMilitaryDoc || formData.militaryObligationsDocument) &&
        (!requiresPublicEmployeeDoc || formData.publicEmployeePermissionDocument) &&
        (!requiresNotParticipatedDoc ||
          formData.notParticipatedDeclarationDocument) &&
        (!requiresEuCitizenDoc ||
          formData.euCitizenGreekLanguageCertificateDocument)
      );
    };

    setStepValidation({
      1: validatePersonalInfo(),
      2: validateScientificField(),
      3: validateCoursePlan(),
      4: validateBio(),
      5: validatePhd(),
      6: validatePublications(),
      7: validateWorkExperience(),
      8: validateDocuments(),
    });
  }, [formData, currentUser?.gender, positions]);

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
