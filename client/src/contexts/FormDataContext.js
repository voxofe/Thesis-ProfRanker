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

export const FormDataContext = createContext();

export const useFormData = () => useContext(FormDataContext);

export const FormDataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const formMode = (searchParams.get("mode") || "new").toLowerCase();
  const selectedApplicationId = searchParams.get("applicationId");
  const [profileData, setProfileData] = useState(null);
  const phdDegrees = useMemo(
    () => (Array.isArray(profileData?.phdDegrees) ? profileData.phdDegrees : []),
    [profileData]
  );
  const [profilePolling, setProfilePolling] = useState(false);

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
      phdDegreeId: null,
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
      publications: [],
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
        phdDegreeId: selectedForm.phdDegreeId ?? null,
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
        publications: selectedForm.publications ?? [],
      };
    }

    if (profileSnapshot) {
      const vault = profileSnapshot.documentVault || {};
      const defaults = profileSnapshot.applicationDefaults || {};
      const degrees = Array.isArray(profileSnapshot.phdDegrees)
        ? profileSnapshot.phdDegrees
        : [];
      const defaultTitle = (defaults.phdTitle || "").trim();
      const defaultDate = defaults.phdAcquisitionDate || "";
      const profilePhdDocId = profileSnapshot.documents?.phd?.id;

      const degreeByDoc = degrees.find(
        (degree) =>
          profilePhdDocId &&
          String(degree.document?.id) === String(profilePhdDocId)
      );
      const degreeByDefaults = degrees.find(
        (degree) =>
          defaultTitle &&
          defaultDate &&
          (degree.title || "").trim() === defaultTitle &&
          String(degree.acquiredAt || "") === String(defaultDate)
      );
      const selectedDegree = degreeByDoc || degreeByDefaults || null;
      const isForeignInstitute = selectedDegree
        ? !!selectedDegree.isForeignInstitute
        : defaults.phdIsFromForeignInstitute ?? false;

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
        phdTitle: selectedDegree?.title ?? defaults.phdTitle ?? "",
        phdAcquisitionDate:
          selectedDegree?.acquiredAt ?? defaults.phdAcquisitionDate ?? "",
        phdIsFromForeignInstitute: isForeignInstitute,
        phdDegreeId: selectedDegree?.id ?? null,
        workExperience: defaults.workExperience ?? "",
        publications: profileSnapshot.profilePublications ?? [],
        cvDocument: buildDocItem(profileSnapshot.documents?.cv),
        phdDocument: selectedDegree
          ? buildDocItem(selectedDegree.document)
          : buildDocItem(profileSnapshot.documents?.phd),
        doatapDocument: isForeignInstitute
          ? buildDocItem(
              selectedDegree?.doatapDocument || profileSnapshot.documents?.doatap
            )
          : null,
        coursePlanDocument: buildDocItem(profileSnapshot.documents?.coursePlan),
        militaryObligationsDocument: buildDocItem(profileSnapshot.documents?.military),
        publicEmployeePermissionDocument: defaults.isPublicEmployee
          ? buildDocItem(profileSnapshot.documents?.publicEmployeePermission)
          : null,
        notParticipatedDeclarationDocument: defaults.hasNotParticipatedInPastProgram
          ? buildDocItem(profileSnapshot.documents?.notParticipatedDeclaration)
          : null,
        euCitizenGreekLanguageCertificateDocument: defaults.isEuCitizenNonGreek
          ? buildDocItem(profileSnapshot.documents?.euCitizenGreekLanguageCertificate)
          : null,
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
  const documentVault = profileData?.documentVault || {};

  const buildPhdDocItem = (doc) => buildDocItem(doc);

  const findMatchingPhdDegree = (nextState) => {
    if (!phdDegrees.length) return null;

    const docId = nextState.phdDocument?.id;
    if (docId) {
      const byDoc = phdDegrees.find(
        (degree) => String(degree.document?.id) === String(docId)
      );
      if (byDoc) return byDoc;
    }

    const title = (nextState.phdTitle || "").trim();
    const date = nextState.phdAcquisitionDate || "";

    if (title && date) {
      const matches = phdDegrees.filter(
        (degree) =>
          (degree.title || "").trim() === title &&
          String(degree.acquiredAt || "") === String(date)
      );
      if (matches.length === 1) return matches[0];
    }

    if (title) {
      const matches = phdDegrees.filter(
        (degree) => (degree.title || "").trim() === title
      );
      if (matches.length === 1) return matches[0];
    }

    if (date) {
      const matches = phdDegrees.filter(
        (degree) => String(degree.acquiredAt || "") === String(date)
      );
      if (matches.length === 1) return matches[0];
    }

    return null;
  };

  const applyPhdDegree = (prevState, degree) => {
    if (!degree) {
      return {
        ...prevState,
        phdDegreeId: null,
      };
    }

    return {
      ...prevState,
      phdDegreeId: degree.id ?? null,
      phdTitle: degree.title ?? "",
      phdAcquisitionDate: degree.acquiredAt ?? "",
      phdIsFromForeignInstitute: !!degree.isForeignInstitute,
      phdDocument: buildPhdDocItem(degree.document),
      doatapDocument: degree.isForeignInstitute
        ? buildPhdDocItem(degree.doatapDocument)
        : null,
    };
  };

  const appliedPositionIds = useMemo(() => {
    const applications = profileData?.applications || [];
    return applications
      .map((app) => app.positionId)
      .filter((posId) => posId !== null && posId !== undefined && posId !== "");
  }, [profileData]);

  const refreshProfileData = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setProfileData(null);
      return Promise.resolve();
    }
    return axios
      .get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfileData(res.data || null);
      })
      .catch((error) => {
        console.error("Error loading profile:", error);
        setProfileData(null);
      });
  };

  // Re-initialize form data when user changes (for auto-fill)
  useEffect(() => {
    refreshProfileData();
  }, [currentUser]);

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
    setFormData((prevData) => {
      if (formMode === "edit" && field === "positionId") {
        return prevData;
      }
      return {
        ...prevData,
        [field]: value,
      };
    });
  };

  const handlePhdTitleChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      phdTitle: value,
    }));
  };

  const handlePhdDateChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      phdAcquisitionDate: value,
    }));
  };

  const handlePhdDocumentChange = (value) => {
    setFormData((prevData) => {
      const nextState = {
        ...prevData,
        phdDocument: value,
      };

      if (!value) {
        return {
          ...nextState,
          phdDegreeId: null,
        };
      }

      if (value instanceof File) {
        return {
          ...nextState,
          phdDegreeId: null,
        };
      }

      const match = phdDegrees.find(
        (degree) => String(degree.document?.id) === String(value?.id)
      );
      if (!match) {
        return {
          ...nextState,
          phdDegreeId: null,
        };
      }
      return applyPhdDegree(nextState, match);
    });
  };

  const handlePhdForeignInstituteChange = (value) => {
    setFormData((prevData) => {
      const nextState = {
        ...prevData,
        phdIsFromForeignInstitute: value,
      };

      if (!value) {
        nextState.doatapDocument = null;
      }

      return nextState;
    });
  };

  const handleFileChange = (field, file) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: file,
    }));
  };

  const handleFileDelete = (field) => {
    if (field === "phdDocument") {
      setFormData((prevData) => ({
        ...prevData,
        phdDocument: null,
        phdDegreeId: null,
      }));
      return;
    }

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

  useEffect(() => {
    const applications = profileData?.applications || [];
    const hasPending = applications.some(
      (app) => app?.phdDocumentStatus?.status === "pending"
    );
    if (!hasPending) {
      setProfilePolling(false);
      return undefined;
    }

    setProfilePolling(true);
    const intervalId = setInterval(() => {
      refreshProfileData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [profileData]);

  const phdDocumentStatus = useMemo(() => {
    const applications = profileData?.applications || [];
    if (!formData?.positionId) return null;
    const match = applications.find(
      (app) => String(app.positionId) === String(formData.positionId)
    );
    return match?.phdDocumentStatus || null;
  }, [profileData, formData?.positionId]);

  return (
    <FormDataContext.Provider
      value={{
        formData,
        formMode,
        appliedPositionIds,
        documentVault,
        phdDegrees,
        phdDocumentStatus,
        profilePolling,
        handleChange,
        handleFileChange,
        handleFileDelete,
        handlePhdTitleChange,
        handlePhdDateChange,
        handlePhdDocumentChange,
        handlePhdForeignInstituteChange,
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
