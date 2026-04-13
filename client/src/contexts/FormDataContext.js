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
      phoneNumber: "",
      landlineNumber: "",
      streetAddress: "",
      city: "",
      postalCode: "",
      isPublicEmployee: false,
      isEuCitizenNonGreek: false,
      phdTitle: "",
      phdAcquisitionDate: "",
      phdIsFromForeignInstitute: false,
      workExperience: "",
      hasNotParticipatedInPastProgram: false,
      cvDocument: null,
      phdDocument: null,
      doatapDocument: null,
      coursePlanDocument: null,
      militaryObligationsDocument: null,
      employmentCertificates: [],
      publicEmployeePermissionDocument: null,
      notParticipatedDeclarationDocument: null,
      euCitizenGreekLanguageCertificateDocument: null,
      responsibleDeclarationDocument: null,
      papers: [],
      positionId: "",
    };

    // Auto-fill with existing form data if user is applicant and has submitted before
    if (currentUser?.role === "applicant" && currentUser?.form) {
      const form = currentUser.form;
      return {
        ...baseData,
        phoneNumber: form.phoneNumber ?? "",
        landlineNumber: form.landlineNumber ?? "",
        streetAddress: form.streetAddress ?? "",
        city: form.city ?? "",
        postalCode: form.postalCode ?? "",
        isPublicEmployee: form.isPublicEmployee ?? false,
        isEuCitizenNonGreek: form.isEuCitizenNonGreek ?? false,
        phdTitle: form.phdTitle ?? "",
        phdAcquisitionDate: form.phdAcquisitionDate ?? "",
        phdIsFromForeignInstitute: form.phdIsFromForeignInstitute ?? false,
        workExperience: form.workExperience ?? "",
        hasNotParticipatedInPastProgram: form.hasNotParticipatedInPastProgram ?? false,
        positionId: form.positionId ?? "", // positionId from backend
        cvDocument: form.cvDocument ?? null,
        phdDocument: form.phdDocument ?? null,
        doatapDocument: form.doatapDocument ?? null,
        coursePlanDocument: form.coursePlanDocument ?? null,
        militaryObligationsDocument: form.militaryObligationsDocument ?? null,
        employmentCertificates: form.employmentCertificates?.map((item) => item.name ?? item) ?? [],
        publicEmployeePermissionDocument: form.publicEmployeePermissionDocument ?? null,
        notParticipatedDeclarationDocument: form.notParticipatedDeclarationDocument ?? null,
        euCitizenGreekLanguageCertificateDocument:
          form.euCitizenGreekLanguageCertificateDocument ?? null,
        responsibleDeclarationDocument: form.responsibleDeclarationDocument ?? null,
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

  const addEmploymentCertificate = (file) => {
    setFormData((prevData) => ({
      ...prevData,
      employmentCertificates: [...(prevData.employmentCertificates || []), file],
    }));
  };

  const removeEmploymentCertificate = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      employmentCertificates: (prevData.employmentCertificates || []).filter(
        (_, currentIndex) => currentIndex !== index
      ),
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
