import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthContext";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

const FormDataContext = createContext();

export const useFormData = () => useContext(FormDataContext);

export const FormDataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const formMode = (searchParams.get("mode") || "new").toLowerCase();
  const selectedApplicationId = searchParams.get("applicationId");
  const [profileData, setProfileData] = useState(null);
  const [latestPapers, setLatestPapers] = useState([]);

  // Initial form data structure
  const buildDocItem = (doc) => {
    if (!doc || !doc.name) return null;
    return {
      id: doc.id ?? null,
      name: doc.name,
    };
  };

  const getInitialFormData = (selectedForm = null, profileSnapshot = null) => {
    const baseData = {
      firstName: profileSnapshot?.user?.firstName ?? currentUser?.firstName ?? "",
      lastName: profileSnapshot?.user?.lastName ?? currentUser?.lastName ?? "",
      email: profileSnapshot?.user?.email ?? currentUser?.email ?? "",
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
    if (selectedForm) {
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
        cvDocument: selectedForm.cvDocument
          ? { id: selectedForm.cvDocumentId ?? null, name: selectedForm.cvDocument }
          : null,
        phdDocument: selectedForm.phdDocument
          ? { id: selectedForm.phdDocumentId ?? null, name: selectedForm.phdDocument }
          : null,
        doatapDocument: selectedForm.doatapDocument
          ? { id: selectedForm.doatapDocumentId ?? null, name: selectedForm.doatapDocument }
          : null,
        coursePlanDocument: selectedForm.coursePlanDocument
          ? { id: selectedForm.coursePlanDocumentId ?? null, name: selectedForm.coursePlanDocument }
          : null,
        militaryObligationsDocument: selectedForm.militaryObligationsDocument
          ? { id: selectedForm.militaryObligationsDocumentId ?? null, name: selectedForm.militaryObligationsDocument }
          : null,
        bioSupportingDocuments:
          selectedForm.bioSupportingDocuments?.map((item) =>
            typeof item === "string" ? { id: null, name: item } : item
          ) ?? [],
        employmentCertificates:
          selectedForm.employmentCertificates?.map((item) =>
            typeof item === "string" ? { id: null, name: item } : item
          ) ?? [],
        publicEmployeePermissionDocument: selectedForm.publicEmployeePermissionDocument
          ? {
              id: selectedForm.publicEmployeePermissionDocumentId ?? null,
              name: selectedForm.publicEmployeePermissionDocument,
            }
          : null,
        notParticipatedDeclarationDocument: selectedForm.notParticipatedDeclarationDocument
          ? {
              id: selectedForm.notParticipatedDeclarationDocumentId ?? null,
              name: selectedForm.notParticipatedDeclarationDocument,
            }
          : null,
        euCitizenGreekLanguageCertificateDocument: selectedForm.euCitizenGreekLanguageCertificateDocument
          ? {
              id: selectedForm.euCitizenGreekLanguageCertificateDocumentId ?? null,
              name: selectedForm.euCitizenGreekLanguageCertificateDocument,
            }
          : null,
        responsibleDeclarationDocument: selectedForm.responsibleDeclarationDocument
          ? {
              id: selectedForm.responsibleDeclarationDocumentId ?? null,
              name: selectedForm.responsibleDeclarationDocument,
            }
          : null,
        papers: selectedForm.papers ?? [],
      };
    }

    if (profileSnapshot) {
      const vault = profileSnapshot.documentVault || {};
      const defaults = profileSnapshot.applicationDefaults || {};
      return {
        ...baseData,
        phoneNumber: profileSnapshot.user?.mobileNumber ?? "",
        landlineNumber: profileSnapshot.user?.landlineNumber ?? "",
        streetAddress: profileSnapshot.user?.streetAddress ?? "",
        city: profileSnapshot.user?.city ?? "",
        postalCode: profileSnapshot.user?.postalCode ?? "",
        isPublicEmployee: defaults.isPublicEmployee ?? false,
        isEuCitizenNonGreek: defaults.isEuCitizenNonGreek ?? false,
        hasNotParticipatedInPastProgram: defaults.hasNotParticipatedInPastProgram ?? false,
        phdTitle: defaults.phdTitle ?? "",
        phdAcquisitionDate: defaults.phdAcquisitionDate ?? "",
        phdIsFromForeignInstitute: defaults.phdIsFromForeignInstitute ?? false,
        workExperience: defaults.workExperience ?? "",
        papers: latestPapers ?? [],
        cvDocument: buildDocItem(profileSnapshot.documents?.cv),
        phdDocument: buildDocItem(profileSnapshot.documents?.phd),
        doatapDocument: buildDocItem(profileSnapshot.documents?.doatap),
        coursePlanDocument: buildDocItem(profileSnapshot.documents?.coursePlan),
        militaryObligationsDocument: buildDocItem(profileSnapshot.documents?.military),
        publicEmployeePermissionDocument: buildDocItem(
          profileSnapshot.documents?.publicEmployeePermission
        ),
        notParticipatedDeclarationDocument: buildDocItem(
          profileSnapshot.documents?.notParticipatedDeclaration
        ),
        euCitizenGreekLanguageCertificateDocument: buildDocItem(
          profileSnapshot.documents?.euCitizenGreekLanguageCertificate
        ),
        responsibleDeclarationDocument: buildDocItem(
          profileSnapshot.documents?.responsibleDeclaration
        ),
        bioSupportingDocuments: (vault.bio_supporting || []).map(buildDocItem).filter(Boolean),
        employmentCertificates: (vault.employment_certificate || []).map(buildDocItem).filter(Boolean),
      };
    }

    return baseData;
  };

  const [formData, setFormData] = useState(getInitialFormData());

  const appliedPositionIds = useMemo(() => {
    const applications = profileData?.applications || [];
    return applications
      .map((app) => app.positionId)
      .filter((posId) => posId !== null && posId !== undefined && posId !== "");
  }, [profileData]);

  // Re-initialize form data when user changes (for auto-fill)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setProfileData(null);
      setLatestPapers([]);
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfileData(res.data || null);
      })
      .catch((error) => {
        console.error("Error loading profile:", error);
        setProfileData(null);
        setLatestPapers([]);
      });
  }, [currentUser]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLatestPapers([]);
      return;
    }

    const latestAppId = profileData?.applications?.[0]?.id;
    if (!latestAppId) {
      setLatestPapers([]);
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/applications/${latestAppId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setLatestPapers(res.data?.papers ?? []);
      })
      .catch((error) => {
        console.error("Error loading latest application papers:", error);
        setLatestPapers([]);
      });
  }, [profileData]);

  useEffect(() => {
    if (formMode === "edit" && selectedApplicationId) {
      const token = localStorage.getItem("token");
      if (!token) {
        setFormData(getInitialFormData(null, profileData));
        return;
      }

      axios
        .get(`${API_BASE_URL}/api/applications/${selectedApplicationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setFormData(getInitialFormData(res.data || null, profileData));
        })
        .catch((error) => {
          console.error("Error loading application:", error);
          setFormData(getInitialFormData(null, profileData));
        });
      return;
    }

    setFormData(getInitialFormData(null, profileData));
  }, [currentUser, formMode, selectedApplicationId, profileData]); // eslint-disable-line react-hooks/exhaustive-deps

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
