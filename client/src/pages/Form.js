import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormData } from "../contexts/FormDataContext";
import { useValidation } from "../contexts/ValidationContext";
import PersonalInfoSection from "../components/form-sections/PersonalInfoSection";
import PhdSection from "../components/form-sections/PhdSection";
import ScientificFieldSection from "../components/form-sections/ScientificFieldSection";
import BioSection from "../components/form-sections/BioSection";
import PapersSection from "../components/form-sections/PapersSection";
import CoursePlanSection from "../components/form-sections/CoursePlanSection";
import Stepper from "../components/Stepper";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";


export default function Form({ academicYear }) {
  const { formData } = useFormData();
  const { canAccessStep, canProceedFromStep, stepValidation } = useValidation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [redirectLoading, setRedirectLoading] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Γενικά Στοιχεία",
      description: "Βασικές πληροφορίες",
      component: PersonalInfoSection,
    },
    {
      id: 2,
      title: "Επιστημονικό Πεδίο",
      component: ScientificFieldSection,
    },
    {
      id: 3,
      title: "Σχεδιάγραμμα Διδασκαλίας",
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
      title: "Διδακτορικό",
      component: PhdSection,
    },
    {
      id: 5,
      title: "Ακαδημαϊκές εργασίες",
      component: PapersSection,
    },
    {
      id: 6,
      title: "Τελικές Πληροφορίες",
      component: BioSection,
    },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;
  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;

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
    const cleanedPapers = formData.papers.map(paper => ({
      ...paper,
      issn: paper.issn ? paper.issn.replace(/\(wrong\)/gi, "").trim() : paper.issn,
    }));

    const formDataToSend = new FormData();

    // Append text fields
    Object.keys(formData).forEach((key) => {
      if (formData[key] && typeof formData[key] !== "object") {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Append files
    [
      "cvDocument",
      "phdDocument",
      "doatapDocument",
      "coursePlanDocument",
      "militaryObligationsDocument",
      
    ].forEach((field) => {
      if (formData[field]) {
        formDataToSend.append(field, formData[field]);
      }
    });

    // Convert papers to a JSON string and append it to the FormData
    formDataToSend.append("papers", JSON.stringify(cleanedPapers));

    // Debugging: Log the FormData contents
    console.log("FormData contents:");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Send the form data to the server
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/submit",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Content type for file uploads
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Form submitted successfully:", response.data);
      setNotification({
        message: "Η αίτηση υποβλήθηκε επιτυχώς!",
        type: "success",
      });

      refreshUser();
      setTimeout(() => {
        setRedirectLoading(true); // Show loading screen
        setTimeout(() => {
          navigate("/");
        }, 1500); // Show loading for 1.5 seconds before redirect
      }, 500); // Wait for notification to show first
    } catch (error) {
      console.error("Error submitting form:", error);
      setNotification({
        message: "Αποτυχία υποβολής αίτησης. Παρακαλώ δοκιμάστε ξανά.",
        type: "error",
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
          <span className="ml-2 text-patras-buccaneer">Υποβολή αίτησης...</span>
        </div>
      )}

      {/* Notification */}
      {notification.message && (
        <div
          className={`mb-4 px-4 py-3 rounded-md text-sm font-medium ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {notification.message}
        </div>
      )}

      <Stepper
        steps={steps}
        currentStep={currentStep}
        maxStepReached={maxStepReached}
        onStepClick={handleStepClick}
        canAccessStep={canAccessStep}
      />


      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 h-[450px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
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
            Υποβολή Αίτησης
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceedFromStep(currentStep)}
            className="rounded-md bg-patras-buccaneer px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Επόμενο
          </button>
        )}
      </div>


    </div>
  );
}
