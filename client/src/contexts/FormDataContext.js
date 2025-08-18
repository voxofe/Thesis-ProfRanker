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
      scientificField: "",
      workExperience: 0,
      hasNotParticipatedInPastProgram: false,
      cvDocument: null,
      phdDocument: null,
      doatapDocument: null,
      coursePlanDocument: null,
      militaryObligationsDocument: null,
      papers: [],
    };

    // Auto-fill with existing form data if user is applicant and has submitted before
    if (currentUser?.role === "applicant" && currentUser?.form) {
      return {
        ...baseData,
        ...currentUser.form,
        // Preserve existing file names from backend (strings) but allow new uploads (File objects)
        cvDocument: currentUser.form.cvDocument || null,
        phdDocument: currentUser.form.phdDocument || null,
        doatapDocument: currentUser.form.doatapDocument || null,
        coursePlanDocument: currentUser.form.coursePlanDocument || null,
        militaryObligationsDocument: currentUser.form.militaryObligationsDocument || null,
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
