import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useSearchParams } from "react-router-dom";

const FormDataContext = createContext();

export const useFormData = () => useContext(FormDataContext);

export const FormDataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const formMode = (searchParams.get("mode") || "new").toLowerCase();
  const selectedApplicationId = searchParams.get("applicationId");

  // Initial form data structure
  const getSelectedApplication = () => {
    if (formMode !== "edit") return null;
    const applications = currentUser?.applications || [];
    if (selectedApplicationId) {
      return applications.find(
        (app) => String(app.id) === String(selectedApplicationId)
      );
    }
    return currentUser?.form || null;
  };

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
      bioSupportingDocuments: [],
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
      const selectedForm = getSelectedApplication() || currentUser.form;
      return {
        ...baseData,
        phoneNumber: selectedForm.phoneNumber ?? "",
        landlineNumber: selectedForm.landlineNumber ?? "",
        streetAddress: selectedForm.streetAddress ?? "",
        city: selectedForm.city ?? "",
        postalCode: selectedForm.postalCode ?? "",
        isPublicEmployee: selectedForm.isPublicEmployee ?? false,
        isEuCitizenNonGreek: selectedForm.isEuCitizenNonGreek ?? false,
        phdTitle: selectedForm.phdTitle ?? "",
        phdAcquisitionDate: selectedForm.phdAcquisitionDate ?? "",
        phdIsFromForeignInstitute: selectedForm.phdIsFromForeignInstitute ?? false,
        workExperience: selectedForm.workExperience ?? "",
        hasNotParticipatedInPastProgram: selectedForm.hasNotParticipatedInPastProgram ?? false,
        positionId: formMode === "edit" ? selectedForm.positionId ?? "" : "",
        cvDocument: selectedForm.cvDocument ?? null,
        phdDocument: selectedForm.phdDocument ?? null,
        doatapDocument: selectedForm.doatapDocument ?? null,
        coursePlanDocument: selectedForm.coursePlanDocument ?? null,
        militaryObligationsDocument: selectedForm.militaryObligationsDocument ?? null,
        bioSupportingDocuments:
          selectedForm.bioSupportingDocuments?.map((item) => item.name ?? item) ?? [],
        employmentCertificates:
          selectedForm.employmentCertificates?.map((item) => item.name ?? item) ?? [],
        publicEmployeePermissionDocument:
          selectedForm.publicEmployeePermissionDocument ?? null,
        notParticipatedDeclarationDocument:
          selectedForm.notParticipatedDeclarationDocument ?? null,
        euCitizenGreekLanguageCertificateDocument:
          selectedForm.euCitizenGreekLanguageCertificateDocument ?? null,
        responsibleDeclarationDocument: selectedForm.responsibleDeclarationDocument ?? null,
        papers: selectedForm.papers ?? [],
      };
    }

    return baseData;
  };

  const [formData, setFormData] = useState(getInitialFormData());

  const appliedPositionIds = useMemo(() => {
    const applications = currentUser?.applications || [];
    return applications
      .map((app) => app.positionId)
      .filter((posId) => posId !== null && posId !== undefined && posId !== "");
  }, [currentUser]);

  // Re-initialize form data when user changes (for auto-fill)
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [currentUser, formMode, selectedApplicationId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const addBioSupportingDocument = (file) => {
    setFormData((prevData) => ({
      ...prevData,
      bioSupportingDocuments: [...(prevData.bioSupportingDocuments || []), file],
    }));
  };

  const removeBioSupportingDocument = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      bioSupportingDocuments: (prevData.bioSupportingDocuments || []).filter(
        (_, currentIndex) => currentIndex !== index
      ),
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
        formMode,
        appliedPositionIds,
        handleChange,
        handleFileChange,
        handleFileDelete,
        addEmploymentCertificate,
        removeEmploymentCertificate,
        addBioSupportingDocument,
        removeBioSupportingDocument,
      }}
    >
      {children}
    </FormDataContext.Provider>
  );
};
