import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormData } from "../contexts/FormDataContext";
import { useValidation } from "../contexts/ValidationContext";
import PersonalInfoSection from "../components/form-sections/PersonalInfoSection";
import BioSection from "../components/form-sections/BioSection";
import ScientificFieldSection from "../components/form-sections/ScientificFieldSection";
import CoursePlanSection from "../components/form-sections/CoursePlanSection";
import PhdSection from "../components/form-sections/PhdSection";
import PublicationsSection from "../components/form-sections/PublicationsSection";
import WorkExperienceSection from "../components/form-sections/WorkExperienceSection";
import DocumentsSection from "../components/form-sections/DocumentsSection";
import Stepper from "../components/Stepper";
import Tooltip from "../components/Tooltip";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);


export default function Form({ academicYear }) {
  const { formData, formMode } = useFormData();
  const { canAccessStep, canProceedFromStep, stepValidation } = useValidation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const { showToast } = useToast();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [redirectLoading, setRedirectLoading] = useState(false);
  const nextButtonRef = useRef(null);
  const [openNextTip, setOpenNextTip] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Γενικά στοιχεία",
      description: "Βασικές πληροφορίες",
      component: PersonalInfoSection,
    },
    {
      id: 2,
      title: "Επιστημονικό πεδίο",
      component: ScientificFieldSection,
    },
    {
      id: 3,
      title: "Σχεδιάγραμμα διδασκαλίας",
      component: (props) => (
        <CoursePlanSection
          formData={formData}
          handleFileChange={props.handleFileChange}
          handleFileDelete={props.handleFileDelete}
        />
      ),
    },
    {
      id: 4,
      title: "Βιογραφικό",
      component: BioSection,
    },
    {
      id: 5,
      title: "Διδακτορικό",
      component: PhdSection,
    },
    {
      id: 6,
      title: "Επιστημονικές δημοσιεύσεις",
      component: PublicationsSection,
    },
    {
      id: 7,
      title: "Εργασιακή εμπειρία",
      component: WorkExperienceSection,
    },
    {
      id: 8,
      title: "Υπεύθυνες δηλώσεις",
      component: DocumentsSection,
    },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;
  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;
  const nextDisabled = !canProceedFromStep(currentStep);
  const submitLabel = formMode === "edit" ? "Επανυποβολή αίτησης" : "Υποβολή αίτησης";

  // Only these steps need overflow-visible (add more IDs if needed)
  const stepsNeedingOverflow = new Set([5]);
  const contentOverflow =  stepsNeedingOverflow.has(currentStep) ? "overflow-visible" : "overflow-y-auto";

  const handleStepClick = (step) => {
    // Only allow navigation to accessible steps
    if (canAccessStep(step)) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    // Only allow progression if current step is valid
    if (canProceedFromStep(currentStep) && currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setMaxStepReached(Math.max(maxStepReached, nextStep));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Clean ISSN values before sending
    const cleanedPublications = formData.publications.map(publication => ({
      ...publication,
      issn: publication.issn ? publication.issn.replace(/\(wrong\)/gi, "").trim() : publication.issn,
    }));

    const formDataToSend = new FormData();

    // Append other fields
    formDataToSend.append("email", formData.email || "");
    formDataToSend.append("phoneNumber", formData.phoneNumber || "");
    formDataToSend.append("landlineNumber", formData.landlineNumber || "");
    formDataToSend.append("streetAddress", formData.streetAddress || "");
    formDataToSend.append("city", formData.city || "");
    formDataToSend.append("postalCode", formData.postalCode || "");

    formDataToSend.append("isPublicEmployee", String(formData.isPublicEmployee));
    formDataToSend.append(
      "phdIsFromForeignInstitute",
      String(formData.phdIsFromForeignInstitute)
    );
    formDataToSend.append(
      "hasNotParticipatedInPastProgram",
      String(formData.hasNotParticipatedInPastProgram)
    );
    formDataToSend.append(
      "isEuCitizenNonGreek",
      String(formData.isEuCitizenNonGreek)
    );

    formDataToSend.append("phdTitle", formData.phdTitle || "");
    formDataToSend.append("phdAcquisitionDate", formData.phdAcquisitionDate || "");
    formDataToSend.append("phdDegreeId", formData.phdDegreeId ?? "");
    formDataToSend.append("workExperience", String(formData.workExperience ?? ""));
    formDataToSend.append("positionId", formData.positionId || "");

    const singleDocFields = [
      "cvDocument",
      "phdDocument",
      "doatapDocument",
      "coursePlanDocument",
      "militaryObligationsDocument",
      "publicEmployeePermissionDocument",
      "notParticipatedDeclarationDocument",
      "euCitizenGreekLanguageCertificateDocument",
      "responsibleDeclarationDocument",
    ];

    const conditionalDocGuards = {
      publicEmployeePermissionDocument: formData.isPublicEmployee,
      euCitizenGreekLanguageCertificateDocument: formData.isEuCitizenNonGreek,
      notParticipatedDeclarationDocument: formData.hasNotParticipatedInPastProgram,
    };

    const toIdField = (field) => `${field}Id`;

    singleDocFields.forEach((field) => {
      if (field in conditionalDocGuards && !conditionalDocGuards[field]) {
        formDataToSend.append(toIdField(field), "");
        return;
      }
      const value = formData[field];
      if (value instanceof File) {
        formDataToSend.append(field, value);
        return;
      }
      if (value && typeof value === "object" && value.id) {
        formDataToSend.append(toIdField(field), String(value.id));
        return;
      }
      formDataToSend.append(toIdField(field), "");
    });

    const bioKeepIds = [];
    (formData.bioSupportingDocuments || []).forEach((bioDocument) => {
      if (bioDocument instanceof File) {
        formDataToSend.append("bioSupportingDocuments", bioDocument);
        return;
      }
      if (bioDocument?.id) {
        bioKeepIds.push(bioDocument.id);
      }
    });
    formDataToSend.append("bioSupportingDocumentIds", JSON.stringify(bioKeepIds));

    const employmentKeepIds = [];
    (formData.employmentCertificates || []).forEach((certificate) => {
      if (certificate instanceof File) {
        formDataToSend.append("employmentCertificateDocuments", certificate);
        return;
      }
      if (certificate?.id) {
        employmentKeepIds.push(certificate.id);
      }
    });
    formDataToSend.append(
      "employmentCertificateDocumentIds",
      JSON.stringify(employmentKeepIds)
    );

    // Convert publications to a JSON string and append it to the FormData
    formDataToSend.append("publications", JSON.stringify(cleanedPublications));

    // Debugging: Log the FormData contents
    console.log("FormData contents:");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Send the form data to the server
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/submit`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Content type for file uploads
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Form submitted successfully:", response.data);
      showToast({
        type: "success",
        message: "Η αίτηση υποβλήθηκε επιτυχώς!",
      });

      refreshUser();
      setTimeout(() => {
        setRedirectLoading(true); // Show loading screen
        setTimeout(() => {
          navigate("/");
        }, 1500); // Show loading for 1.5 seconds before redirect
      }, 500); // Allow toast to show before redirect
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast({
        type: "error",
        message: "Αποτυχία υποβολής αίτησης. Παρακαλώ δοκιμάστε ξανά.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (redirectLoading) {
    return (
      <div className="flex justify-center min-h-screen min-w-screen">
        <div className="w-[1270px] px-7 py-4 flex flex-col min-h-screen">
          <div className="flex flex-1 justify-center items-center py-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-patras-buccaneer"></div>
              <p className="mt-4 text-gray-600">Φόρτωση...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const headerTitle =
    formMode === "edit"
      ? "Επεξεργασία αίτησης υποψηφιότητας"
      : "Νέα αίτηση υποψηφιότητας";

  return (
    <div className="w-full max-w-6xl mx-auto">
      {loading && (
        <div className="flex justify-center items-center mb-4">
          <svg
            className="animate-spin h-6 w-6 text-patras-buccaneer"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span className="ml-2 text-patras-buccaneer">{submitLabel}...</span>
        </div>
      )}

      <h1 className="text-2xl text-center border-b pb-2 mb-8 text-gray-800">
        {headerTitle}
      </h1>
      <Stepper
        steps={steps}
        currentStep={currentStep}
        maxStepReached={maxStepReached}
        onStepClick={handleStepClick}
        canAccessStep={canAccessStep}
      />


      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 min-h-[450px] flex flex-col">
        <div className={`flex-1 ${contentOverflow} p-6`}>
          <CurrentStepComponent academicYear={academicYear} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-patras-buccaneer border border-patras-buccaneer shadow-sm hover:bg-patras-albescentWhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patras-buccaneer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Προηγούμενο
        </button>

        {isLastStep ? (
          <button
            disabled={!steps.every((step) => stepValidation[step.id])}
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-patras-buccaneer px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitLabel}
          </button>
        ) : (
          <span
            className="inline-block"
            ref={nextButtonRef}
            onMouseEnter={() => nextDisabled && setOpenNextTip(true)}
            onMouseLeave={() => setOpenNextTip(false)}
            onFocus={() => nextDisabled && setOpenNextTip(true)}
            onBlur={() => setOpenNextTip(false)}
          >
            <button
              type="button"
              onClick={handleNext}
              disabled={nextDisabled}
              aria-disabled={nextDisabled}
              className="rounded-md bg-patras-buccaneer px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Επόμενο
            </button>
            <Tooltip
              anchorRef={nextButtonRef}
              open={openNextTip && nextDisabled}
              placement="top-left"
              className="bg-white border border-patras-buccaneer text-patras-buccaneer text-xs px-2 py-1 rounded-lg shadow-lg whitespace-nowrap min-w-max"
            >
              Συμπληρώστε όλα τα υποχρεωτικά πεδία για να συνεχίσετε
            </Tooltip>
          </span>
        )}
      </div>


    </div>
  );
}
