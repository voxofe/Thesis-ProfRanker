import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const FormDataContext = createContext();

export const useFormData = () => useContext(FormDataContext);

export const FormDataProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // Initial form data structure
  const getInitialFormData = () => {
    const baseData = {
      firstName: currentUser?.firstName ?? "",
      lastName: currentUser?.lastName ?? "",
      email: currentUser?.email ?? "",
      phdTitle: "",
      phdAcquisitionDate: "",
      phdIsFromForeignInstitute: false,
      workExperience: 0,
      hasNotParticipatedInPastProgram: false,
      cvDocument: null,
      phdDocument: null,
      doatapDocument: null,
      coursePlanDocument: null,
      militaryObligationsDocument: null,
      papers: [],
      positionId: "",
    };

    // Auto-fill with existing form data if user is applicant and has submitted before
    if (currentUser?.role === "applicant" && currentUser?.form) {
      const form = currentUser.form;
      return {
        ...baseData,
        phdTitle: form.phdTitle ?? "",
        phdAcquisitionDate: form.phdAcquisitionDate ?? "",
        phdIsFromForeignInstitute: form.phdIsFromForeignInstitute ?? false,
        workExperience: form.workExperience ?? 0,
        hasNotParticipatedInPastProgram: form.hasNotParticipatedInPastProgram ?? false,
        positionId: form.positionId ?? "", // positionId from backend
        cvDocument: form.cvDocument ?? null,
        phdDocument: form.phdDocument ?? null,
        doatapDocument: form.doatapDocument ?? null,
        coursePlanDocument: form.coursePlanDocument ?? null,
        militaryObligationsDocument: form.militaryObligationsDocument ?? null,
        papers: form.papers ?? [],
      };
    }

    return baseData;
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Re-initialize form data when user changes (for auto-fill)
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: file,
    }));
  };

  const handleFileDelete = (field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: null,
    }));
  };

  return (
    <FormDataContext.Provider
      value={{
        formData,
        handleChange,
        handleFileChange,
        handleFileDelete,
      }}
    >
      {children}
    </FormDataContext.Provider>
  );
};
