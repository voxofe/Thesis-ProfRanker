import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { FormDataContext } from "../contexts/FormDataContext";
import InputField from "../components/InputField";
import Checkbox from "../components/Checkbox";
import FlowbiteDateField from "../components/FlowbiteDateField";
import CustomSelect from "../components/CustomSelect";
import VaultFileActions from "../components/VaultFileActions";
import TermsModal from "../components/TermsModal";
import PublicationsSection from "../components/form-sections/PublicationsSection";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

export default function Profile() {
  const { userId } = useParams();
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [activeSection, setActiveSection] = useState("general");
  const [activePhdIndex, setActivePhdIndex] = useState(0);
  const [phdSlideDirection, setPhdSlideDirection] = useState("next");
  const [phdSliding, setPhdSliding] = useState(false);
  const [phdNextDraft, setPhdNextDraft] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    mobileNumber: "",
    landlineNumber: "",
    streetAddress: "",
    city: "",
    postalCode: "",
  });
  const [additionalForm, setAdditionalForm] = useState({
    isPublicEmployee: false,
    isEuCitizenNonGreek: false,
    hasNotParticipatedInPastProgram: false,
    phdTitle: "",
    phdAcquisitionDate: "",
    phdIsFromForeignInstitute: false,
    workExperience: "",
  });
  const [phdDraft, setPhdDraft] = useState({
    phdTitle: "",
    phdAcquisitionDate: "",
    phdIsFromForeignInstitute: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAdditional, setSavingAdditional] = useState(false);
  const [savingPublications, setSavingPublications] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isRestrictionsModalOpen, setIsRestrictionsModalOpen] = useState(false);
  const [profilePublications, setProfilePublications] = useState([]);
  const phdDegrees = useMemo(
    () => (Array.isArray(profile?.phdDegrees) ? profile.phdDegrees : []),
    [profile]
  );

  const isAdmin = currentUser?.role === "admin";
  const isAdminViewingOther =
    isAdmin && userId && String(userId) !== String(currentUser?.id);
  const isReadOnly = isAdminViewingOther;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    const profileUrl = isAdminViewingOther
      ? `${API_BASE_URL}/api/admin/profile/${userId}`
      : `${API_BASE_URL}/api/profile`;
    axios
      .get(profileUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setProfile(data);
        setForm({
          firstName: data?.user?.firstName || "",
          lastName: data?.user?.lastName || "",
          email: data?.user?.email || "",
          gender: data?.user?.gender || "",
          mobileNumber: data?.user?.mobileNumber || "",
          landlineNumber: data?.user?.landlineNumber || "",
          streetAddress: data?.user?.streetAddress || "",
          city: data?.user?.city || "",
          postalCode: data?.user?.postalCode || "",
        });
        const defaults = data?.applicationDefaults || {};
        const degrees = Array.isArray(data?.phdDegrees) ? data.phdDegrees : [];
        setAdditionalForm({
          isPublicEmployee: !!defaults.isPublicEmployee,
          isEuCitizenNonGreek: !!defaults.isEuCitizenNonGreek,
          hasNotParticipatedInPastProgram: !!defaults.hasNotParticipatedInPastProgram,
          phdTitle: defaults.phdTitle || "",
          phdAcquisitionDate: defaults.phdAcquisitionDate || "",
          phdIsFromForeignInstitute: !!defaults.phdIsFromForeignInstitute,
          workExperience:
            defaults.workExperience === null || defaults.workExperience === undefined
              ? ""
              : String(defaults.workExperience),
        });
        if (degrees.length > 0) {
          setActivePhdIndex(0);
          setPhdDraft({
            phdTitle: degrees[0]?.title || "",
            phdAcquisitionDate: degrees[0]?.acquiredAt || "",
            phdIsFromForeignInstitute: !!degrees[0]?.isForeignInstitute,
          });
        } else {
          setActivePhdIndex(0);
          setPhdDraft({
            phdTitle: defaults.phdTitle || "",
            phdAcquisitionDate: defaults.phdAcquisitionDate || "",
            phdIsFromForeignInstitute: !!defaults.phdIsFromForeignInstitute,
          });
        }
        setProfilePublications(
          Array.isArray(data?.profilePublications) ? data.profilePublications : []
        );
      })
      .catch((error) => {
        console.error("Error loading profile:", error);
      })
      .finally(() => setLoading(false));
  }, [userId, currentUser?.id, isAdminViewingOther]);

  useEffect(() => {
    if (!phdDegrees.length) {
      setActivePhdIndex(0);
      return;
    }
    setActivePhdIndex((prev) => {
      const nextIndex = Math.min(prev, phdDegrees.length - 1);
      if (nextIndex !== prev) {
        const nextDegree = phdDegrees[nextIndex];
        if (nextDegree) {
          setPhdDraft({
            phdTitle: nextDegree.title || "",
            phdAcquisitionDate: nextDegree.acquiredAt || "",
            phdIsFromForeignInstitute: !!nextDegree.isForeignInstitute,
          });
        }
      }
      return nextIndex;
    });
  }, [phdDegrees]);

  const isProfileApplicant = profile?.user?.role === "applicant";
  const today = new Date().toISOString().split("T")[0];
  const todayDisplay = today.split("-").reverse().join("-");
  const workExperienceOptions = Array.from({ length: 11 }, (_, index) => ({
    value: String(index),
    label: String(index),
  }));
  const canEditIdentity = !isAdminViewingOther && profile?.canEditIdentity !== false;
  const requiresMilitaryDoc = profile?.user?.gender === "male";
  const publicationsContextValue = useMemo(
    () => ({
      formData: { publications: profilePublications },
      handleChange: (field, value) => {
        if (field === "publications") {
          setProfilePublications(value);
        }
      },
    }),
    [profilePublications]
  );

  const validateField = (key, value) => {
    if (!canEditIdentity && ["firstName", "lastName"].includes(key)) {
      return "";
    }
    if (key === "firstName") {
      if (!value.trim()) return "Το όνομα είναι υποχρεωτικό.";
      return "";
    }
    if (key === "lastName") {
      if (!value.trim()) return "Το επώνυμο είναι υποχρεωτικό.";
      return "";
    }
    if (key === "mobileNumber") {
      if (!value.trim()) return "";
      const mobile = normalizePhone(value);
      if (!/^69\d{8}$/.test(mobile)) {
        return "Ο αριθμός κινητού πρέπει να έχει 10 ψηφία και να ξεκινά από 69.";
      }
      return "";
    }
    if (key === "landlineNumber") {
      if (!value.trim()) return "";
      const landline = normalizePhone(value);
      if (!/^2\d{9}$/.test(landline)) {
        return "Ο αριθμός σταθερού πρέπει να έχει 10 ψηφία και να ξεκινά από 2.";
      }
      return "";
    }
    if (key === "postalCode") {
      if (!value.trim()) return "";
      if (!/^\d{5}$/.test(value.trim())) return "Ο Τ.Κ. πρέπει να έχει 5 ψηφία.";
      return "";
    }
    return "";
  };

  const handleFieldChange = (key, value) => {
    const nextForm = { ...form, [key]: value };
    setForm(nextForm);
    const error = validateField(key, value);
    setFormErrors((prev) => ({ ...prev, [key]: error }));
  };

  const handleAdditionalFieldChange = (key, value) => {
    setAdditionalForm((prev) => ({ ...prev, [key]: value }));
  };

  const updatePhdDraft = (key, value) => {
    setPhdDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrevPhd = () => {
    if (!phdDegrees.length) return;
    if (activePhdIndex <= 0) return;
    if (phdSliding) return;
    setPhdSlideDirection("prev");
    setActivePhdIndex((prev) => {
      const nextIndex = Math.max(prev - 1, 0);
      const nextDegree = phdDegrees[nextIndex];
      if (nextDegree) {
        setPhdNextDraft({
          phdTitle: nextDegree.title || "",
          phdAcquisitionDate: nextDegree.acquiredAt || "",
          phdIsFromForeignInstitute: !!nextDegree.isForeignInstitute,
        });
        setPhdSliding(true);
      }
      return nextIndex;
    });
  };

  const handleNextPhd = () => {
    if (!phdDegrees.length) return;
    if (activePhdIndex >= phdDegrees.length - 1) return;
    if (phdSliding) return;
    setPhdSlideDirection("next");
    setActivePhdIndex((prev) => {
      const nextIndex = Math.min(prev + 1, phdDegrees.length - 1);
      const nextDegree = phdDegrees[nextIndex];
      if (nextDegree) {
        setPhdNextDraft({
          phdTitle: nextDegree.title || "",
          phdAcquisitionDate: nextDegree.acquiredAt || "",
          phdIsFromForeignInstitute: !!nextDegree.isForeignInstitute,
        });
        setPhdSliding(true);
      }
      return nextIndex;
    });
  };

  const handlePhdSlideEnd = () => {
    if (!phdSliding) return;
    if (phdNextDraft) {
      setPhdDraft(phdNextDraft);
    }
    setPhdNextDraft(null);
    setPhdSliding(false);
  };

  const normalizePhone = (value) => (value || "").replace(/[\s()-]/g, "");

  const validateProfileForm = () => {
    const errors = {};

    if (canEditIdentity) {
      if (!form.firstName.trim()) {
        errors.firstName = "Το όνομα είναι υποχρεωτικό.";
      }
      if (!form.lastName.trim()) {
        errors.lastName = "Το επώνυμο είναι υποχρεωτικό.";
      }
    }

    if (form.mobileNumber?.trim()) {
      const mobile = normalizePhone(form.mobileNumber);
      if (!/^69\d{8}$/.test(mobile)) {
        errors.mobileNumber =
          "Ο αριθμός κινητού πρέπει να έχει 10 ψηφία και να ξεκινά από 69.";
      }
    }

    if (form.landlineNumber?.trim()) {
      const landline = normalizePhone(form.landlineNumber);
      if (!/^2\d{9}$/.test(landline)) {
        errors.landlineNumber =
          "Ο αριθμός σταθερού πρέπει να έχει 10 ψηφία και να ξεκινά από 2.";
      }
    }

    if (form.postalCode?.trim()) {
      if (!/^\d{5}$/.test(form.postalCode.trim())) {
        errors.postalCode = "Ο Τ.Κ. πρέπει να έχει 5 ψηφία.";
      }
    }

    return errors;
  };

  const handleSaveProfile = async () => {
    if (isAdminViewingOther) {
      showToast({ type: "error", message: "Μόνο ανάγνωση για προφίλ άλλου χρήστη." });
      return;
    }
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast({
        type: "error",
        message: "Ελέγξτε τα πεδία στα Γενικά στοιχεία.",
      });
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      gender: form.gender || null,
      mobileNumber: form.mobileNumber || "",
      landlineNumber: form.landlineNumber || "",
      streetAddress: form.streetAddress || "",
      city: form.city || "",
      postalCode: form.postalCode || "",
    };

    try {
      const response = await axios.put(`${API_BASE_URL}/api/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      const defaults = response.data?.applicationDefaults || {};
      setAdditionalForm({
        isPublicEmployee: !!defaults.isPublicEmployee,
        isEuCitizenNonGreek: !!defaults.isEuCitizenNonGreek,
        hasNotParticipatedInPastProgram: !!defaults.hasNotParticipatedInPastProgram,
        phdTitle: defaults.phdTitle || "",
        phdAcquisitionDate: defaults.phdAcquisitionDate || "",
        phdIsFromForeignInstitute: !!defaults.phdIsFromForeignInstitute,
        workExperience:
          defaults.workExperience === null || defaults.workExperience === undefined
            ? ""
            : String(defaults.workExperience),
      });
      showToast({ type: "success", message: "Οι αλλαγές αποθηκεύτηκαν." });
      refreshUser();
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast({
        type: "error",
        message: error?.response?.data?.error || "Αποτυχία αποθήκευσης.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdditional = async () => {
    if (isAdminViewingOther) {
      showToast({ type: "error", message: "Μόνο ανάγνωση για προφίλ άλλου χρήστη." });
      return;
    }
    setSavingAdditional(true);
    const token = localStorage.getItem("token");

    const workExperienceValue =
      additionalForm.workExperience === ""
        ? null
        : Number(additionalForm.workExperience);

    const payload = {
      applicationDefaults: {
        isPublicEmployee: !!additionalForm.isPublicEmployee,
        isEuCitizenNonGreek: !!additionalForm.isEuCitizenNonGreek,
        hasNotParticipatedInPastProgram:
          !!additionalForm.hasNotParticipatedInPastProgram,
        phdTitle: phdDraft.phdTitle || null,
        phdAcquisitionDate: phdDraft.phdAcquisitionDate || null,
        phdIsFromForeignInstitute: !!phdDraft.phdIsFromForeignInstitute,
        workExperience: Number.isNaN(workExperienceValue)
          ? null
          : workExperienceValue,
      },
    };

    try {
      const response = await axios.put(`${API_BASE_URL}/api/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      const defaults = response.data?.applicationDefaults || {};
      setAdditionalForm({
        isPublicEmployee: !!defaults.isPublicEmployee,
        isEuCitizenNonGreek: !!defaults.isEuCitizenNonGreek,
        hasNotParticipatedInPastProgram: !!defaults.hasNotParticipatedInPastProgram,
        phdTitle: defaults.phdTitle || "",
        phdAcquisitionDate: defaults.phdAcquisitionDate || "",
        phdIsFromForeignInstitute: !!defaults.phdIsFromForeignInstitute,
        workExperience:
          defaults.workExperience === null || defaults.workExperience === undefined
            ? ""
            : String(defaults.workExperience),
      });
      const degrees = Array.isArray(response.data?.phdDegrees)
        ? response.data.phdDegrees
        : [];
      if (!degrees.length) {
        setPhdDraft({
          phdTitle: defaults.phdTitle || "",
          phdAcquisitionDate: defaults.phdAcquisitionDate || "",
          phdIsFromForeignInstitute: !!defaults.phdIsFromForeignInstitute,
        });
      }
      showToast({ type: "success", message: "Οι αλλαγές αποθηκεύτηκαν." });
    } catch (error) {
      console.error("Error saving additional profile data:", error);
      showToast({
        type: "error",
        message: error?.response?.data?.error || "Αποτυχία αποθήκευσης.",
      });
    } finally {
      setSavingAdditional(false);
    }
  };

  const handleSavePublications = async () => {
    if (isAdminViewingOther) {
      showToast({ type: "error", message: "Μόνο ανάγνωση για προφίλ άλλου χρήστη." });
      return;
    }
    setSavingPublications(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setSavingPublications(false);
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/profile`,
        { profilePublications: profilePublications },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
      setProfilePublications(
        Array.isArray(response.data?.profilePublications)
          ? response.data.profilePublications
          : []
      );
      showToast({ type: "success", message: "Οι αλλαγές αποθηκεύτηκαν." });
    } catch (error) {
      console.error("Error saving publications:", error);
      showToast({
        type: "error",
        message: error?.response?.data?.error || "Αποτυχία αποθήκευσης.",
      });
    } finally {
      setSavingPublications(false);
    }
  };


  const renderFilePills = (files) => (
    <div className="flex flex-wrap gap-2">
      {files.map((file) => (
        <VaultFileActions
          key={file.id || file.name}
          file={file}
          onReplace={(selected) => handleVaultReplace(file, selected)}
          onDelete={() => handleVaultDelete(file)}
          onView={() => handleVaultView(file)}
          onDownload={() => handleVaultDownload(file)}
          showReplace={!isReadOnly}
          showDelete={!isReadOnly}
        />
      ))}
    </div>
  );

  const vaultItems = useMemo(() => {
    const items = [];
    const normalizeFiles = (list) => {
      const files = Array.isArray(list)
        ? list.filter((item) => item?.name)
        : [];
      return files.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });
    };
    const addSection = (key, label, docType, list) => {
      items.push({
        key,
        label,
        docType,
        files: normalizeFiles(list),
      });
    };

    const vault = profile?.documentVault || {};

    const restrictionsLabel = (
      <>
        Υπεύθυνη δήλωση σχετικά με τους{" "}
        <button
          type="button"
          className="text-patras-buccaneer underline hover:text-patras-auChico"
          onClick={() => setIsRestrictionsModalOpen(true)}
        >
          περιορισμούς της Πράξης
        </button>
      </>
    );

    addSection("cv", "Βιογραφικό σημείωμα", "cv", vault.cv);
    addSection(
      "bio-supporting",
      "Έγγραφα που τεκμηριώνουν τα διαλαμβανόμενα στο βιογραφικό",
      "bio_supporting",
      vault.bio_supporting
    );
    addSection("phd", "Διδακτορικό δίπλωμα", "phd", vault.phd);
    addSection("doatap", "Έγγραφο αναγνώρισης από ΔΟΑΤΑΠ", "doatap", vault.doatap);
    addSection(
      "employment-certs",
      "Βεβαιώσεις προϋπηρεσίας από τον Φορέα",
      "employment_certificate",
      vault.employment_certificate
    );
    addSection(
      "public-employee-permission",
      "Πρωτοκολλημένη αίτηση για έκδοση σχετικής άδειας από το αρμόδιο όργανο",
      "public_employee_permission",
      vault.public_employee_permission
    );
    addSection(
      "eu-citizen",
      "Πιστοποιητικό ελληνομάθειας Δ΄ επιπέδου από το Κέντρο Ελληνικής Γλώσσας",
      "eu_citizen_greek_language_certificate",
      vault.eu_citizen_greek_language_certificate
    );
    addSection(
      "not-participated",
      "Υπεύθυνη δήλωση μη συμμετοχής σε άλλο πρόγραμμα Απόκτησης Ακαδημαϊκής Διδακτικής Εμπειρίας",
      "not_participated_declaration",
      vault.not_participated_declaration
    );
    if (requiresMilitaryDoc) {
      addSection(
        "military",
        "Υπεύθυνη δήλωση εκπλήρωσης στρατιωτικών υποχρεώσεων / νόμιμης απαλλαγής / αναβολής",
        "military",
        vault.military
      );
    }
    addSection(
      "responsible-declaration",
      restrictionsLabel,
      "responsible_declaration",
      vault.responsible_declaration
    );
    addSection("other", "Άλλα", "other", vault.other);

    return items;
  }, [profile, requiresMilitaryDoc]);

  const handleVaultUpload = async (docType, selectedFile) => {
    if (isReadOnly) return;
    if (!selectedFile || !docType) return;
    const allowed = ["pdf", "doc", "docx", "odt"];
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowed.includes(ext)) {
      showToast({
        type: "error",
        message: "Επιτρέπονται μόνο αρχεία PDF, DOC, DOCX, ODT.",
      });
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast({ type: "error", message: "Το αρχείο πρέπει να είναι έως 5MB." });
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("docType", docType);

    try {
      await axios.post(`${API_BASE_URL}/api/profile/vault`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      showToast({ type: "success", message: "Το αρχείο προστέθηκε." });
      refreshProfileData();
    } catch (error) {
      console.error("Error uploading document:", error);
      showToast({
        type: "error",
        message: error?.response?.data?.error || "Αποτυχία προσθήκης αρχείου.",
      });
    }
  };

  const refreshProfileData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const handleVaultReplace = async (file, selectedFile) => {
    if (isReadOnly) return;
    if (!file?.id || !selectedFile) return;
    const allowed = ["pdf", "doc", "docx", "odt"];
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowed.includes(ext)) {
      showToast({
        type: "error",
        message: "Επιτρέπονται μόνο αρχεία PDF, DOC, DOCX, ODT.",
      });
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast({ type: "error", message: "Το αρχείο πρέπει να είναι έως 5MB." });
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.put(`${API_BASE_URL}/api/profile/vault/${file.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      showToast({ type: "success", message: "Το αρχείο αντικαταστάθηκε." });
      refreshProfileData();
    } catch (error) {
      console.error("Error replacing document:", error);
      showToast({
        type: "error",
        message:
          error?.response?.data?.error || "Αποτυχία αντικατάστασης αρχείου.",
      });
    }
  };

  const handleVaultDelete = async (file) => {
    if (isReadOnly) return;
    if (!file?.id) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/profile/vault/${file.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast({ type: "success", message: "Το αρχείο διαγράφηκε." });
      refreshProfileData();
    } catch (error) {
      console.error("Error deleting document:", error);
      showToast({
        type: "error",
        message:
          error?.response?.data?.error || "Αποτυχία διαγραφής αρχείου.",
      });
    }
  };

  const handleVaultView = async (file) => {
    if (!file?.downloadPath) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}${file.downloadPath}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const blobUrl = window.URL.createObjectURL(response.data);
      window.open(blobUrl, "_blank", "noopener");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000 * 60);
    } catch (error) {
      console.error("Error opening document:", error);
      showToast({ type: "error", message: "Αποτυχία ανοίγματος αρχείου." });
    }
  };

  const handleVaultDownload = async (file) => {
    if (!file?.downloadPath) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}${file.downloadPath}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading document:", error);
      showToast({ type: "error", message: "Αποτυχία λήψης αρχείου." });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-y-5 pt-5">
        <p className="text-center text-gray-600">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div>
        <h1 className="text-2xl text-center border-b pb-2 mb-2 text-gray-800">
          {isAdminViewingOther ? (
            <>
              Φάκελος χρήστη: <span className="text-lg font-semibold">{`${form.firstName} ${form.lastName}`.trim()}</span>
            </>
          ) : (
            "O φακελός μου"
          )}
        </h1>
      </div>
        <h2 className="text-lg text-center font-semibold text-patras-buccaneer ">
            {activeSection === "general" && "Γενικά στοιχεία"}
            {activeSection === "additional" && "Πρόσθετα στοιχεία"}
            {activeSection === "vault" && "Αρχεία"}
            {activeSection === "publications" && "Επιστημονικές δημοσιεύσεις"}
        </h2>
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <aside className="rounded-xl border border-gray-200/70 bg-white/15 p-4 h-fit lg:sticky lg:top-6">
          <nav className="space-y-2 text-sm">
            <button
              type="button"
              onClick={() => setActiveSection("general")}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                activeSection === "general"
                  ? "bg-patras-albescentWhite/80 text-patras-buccaneer border border-patras-buccaneer/20"
                  : "text-gray-700 hover:bg-white/60"
              }`}
            >
              Γενικά στοιχεία
            </button>
            {isProfileApplicant && (
              <button
                type="button"
                onClick={() => setActiveSection("additional")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeSection === "additional"
                    ? "bg-patras-albescentWhite/80 text-patras-buccaneer border border-patras-buccaneer/20"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                Πρόσθετα στοιχεία
              </button>
            )}
            {isProfileApplicant && (
              <button
                type="button"
                onClick={() => setActiveSection("publications")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeSection === "publications"
                    ? "bg-patras-albescentWhite/80 text-patras-buccaneer border border-patras-buccaneer/20"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                Επιστημονικές δημοσιεύσεις
              </button>
            )}
            {isProfileApplicant && (
              <button
                type="button"
                onClick={() => setActiveSection("vault")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeSection === "vault"
                    ? "bg-patras-albescentWhite/80 text-patras-buccaneer border border-patras-buccaneer/20"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                Αρχεία
              </button>

            )}
          </nav>

        </aside>

        <section>

          {!isReadOnly && (
            <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600">
              Οι αλλαγές εδώ δεν επηρεάζουν ήδη υποβληθείσες αιτήσεις.
              Για αλλαγές σε ενεργές αιτήσεις, επεξεργαστείτε τις από την αρχική σελίδα.
            </div>
          )}
          {activeSection === "general" && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-patras-buccaneer mb-2">Βασικά</h3>
                  <div className="rounded-lg border border-patras-buccaneer/10 bg-patras-albescentWhite/30 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(value) => handleFieldChange("email", value)}
                        disabled={!isReadOnly}
                        readOnly={isReadOnly}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        id="firstName"
                        name="firstName"
                        label="Όνομα"
                        type="text"
                        value={form.firstName}
                        onChange={(value) => handleFieldChange("firstName", value)}
                        disabled={!canEditIdentity && !isReadOnly}
                        readOnly={isReadOnly}
                        required
                        error={formErrors.firstName}
                      />
                      <InputField
                        id="lastName"
                        name="lastName"
                        label="Επώνυμο"
                        type="text"
                        value={form.lastName}
                        onChange={(value) => handleFieldChange("lastName", value)}
                        disabled={!canEditIdentity && !isReadOnly}
                        readOnly={isReadOnly}
                        required
                        error={formErrors.lastName}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-patras-buccaneer mb-2">Τηλέφωνα</h3>
                  <div className="rounded-lg border border-patras-buccaneer/10 bg-patras-albescentWhite/30 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      id="mobileNumber"
                      name="mobileNumber"
                      label="Κινητό τηλέφωνο"
                      type="text"
                      value={form.mobileNumber}
                      onChange={(value) => handleFieldChange("mobileNumber", value)}
                      error={formErrors.mobileNumber}
                      readOnly={isReadOnly}
                    />
                    <InputField
                      id="landlineNumber"
                      name="landlineNumber"
                      label="Σταθερό τηλέφωνο"
                      type="text"
                      value={form.landlineNumber}
                      onChange={(value) => handleFieldChange("landlineNumber", value)}
                      error={formErrors.landlineNumber}
                      readOnly={isReadOnly}
                    />
                  </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-patras-buccaneer mb-2">Διεύθυνση</h3>
                  <div className="rounded-lg border border-patras-buccaneer/10 bg-patras-albescentWhite/30 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      id="streetAddress"
                      name="streetAddress"
                      label="Οδός και αριθμός"
                      type="text"
                      value={form.streetAddress}
                      onChange={(value) => handleFieldChange("streetAddress", value)}
                      readOnly={isReadOnly}
                    />
                    <InputField
                      id="city"
                      name="city"
                      label="Πόλη"
                      type="text"
                      value={form.city}
                      onChange={(value) => handleFieldChange("city", value)}
                      readOnly={isReadOnly}
                    />
                    <InputField
                      id="postalCode"
                      name="postalCode"
                      label="Τ.Κ."
                      type="text"
                      value={form.postalCode}
                      onChange={(value) => handleFieldChange("postalCode", value)}
                      error={formErrors.postalCode}
                      readOnly={isReadOnly}
                    />
                  </div>
                  </div>
                </div>
              </div>
            {!isReadOnly && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center justify-center bg-patras-buccaneer text-sm text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors disabled:opacity-60"
                >
                  {saving ? "Αποθήκευση..." : "Αποθήκευση αλλαγών"}
                </button>
              </div>
            )}
            </div>
          )}

          {isProfileApplicant && activeSection === "additional" && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-patras-buccaneer mb-2">Ιδιότητες υποψηφίου</h3>
                  <div className="rounded-lg border border-patras-buccaneer/10 bg-patras-albescentWhite/30 p-4">
                    <div className="flex flex-col gap-3">
                      <Checkbox
                        id="hasNotParticipatedInPastProgram"
                        name="hasNotParticipatedInPastProgram"
                        label="Μη συμμετοχή σε προηγούμενο Πρόγραμμα Απόκτησης Ακαδημαϊκής Διδακτικής Εμπειρίας"
                        description=""
                        checked={additionalForm.hasNotParticipatedInPastProgram}
                        onChange={(value) =>
                          handleAdditionalFieldChange(
                            "hasNotParticipatedInPastProgram",
                            value
                          )
                        }
                        readOnly={isReadOnly}
                      />
                      <Checkbox
                        id="isPublicEmployee"
                        name="isPublicEmployee"
                        label="Δημόσιος υπάλληλος"
                        description=""
                        checked={additionalForm.isPublicEmployee}
                        onChange={(value) =>
                          handleAdditionalFieldChange("isPublicEmployee", value)
                        }
                        readOnly={isReadOnly}
                      />
                      <Checkbox
                        id="isEuCitizenNonGreek"
                        name="isEuCitizenNonGreek"
                        label="Πολίτης Ε.Ε. (εκτός Ελλάδας)"
                        description=""
                        checked={additionalForm.isEuCitizenNonGreek}
                        onChange={(value) =>
                          handleAdditionalFieldChange("isEuCitizenNonGreek", value)
                        }
                        readOnly={isReadOnly}
                      />

                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-patras-buccaneer">
                      Στοιχεία διδακτορικού
                    </h3>
                    {phdDegrees.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePrevPhd}
                          disabled={activePhdIndex === 0}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-patras-buccaneer/40 text-patras-buccaneer hover:bg-patras-albescentWhite disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Προηγούμενο διδακτορικό"
                        >
                          ‹
                        </button>
                        <span className="text-xs text-gray-500">
                          {activePhdIndex + 1} / {phdDegrees.length}
                        </span>
                        <button
                          type="button"
                          onClick={handleNextPhd}
                          disabled={activePhdIndex >= phdDegrees.length - 1}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-patras-buccaneer/40 text-patras-buccaneer hover:bg-patras-albescentWhite disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Επόμενο διδακτορικό"
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </div>
                  <div
                    className="rounded-lg border border-patras-buccaneer/10 bg-patras-albescentWhite/30 overflow-x-hidden overflow-y-visible"
                  >
                    <div
                      className={`flex ${
                        phdSlideDirection === "prev" ? "flex-row-reverse" : "flex-row"
                      } ${phdSliding ? "transition-transform duration-400 ease-out" : ""}`}
                      style={{
                        transform: phdSliding
                          ? phdSlideDirection === "next"
                            ? "translateX(-100%)"
                            : "translateX(100%)"
                          : "translateX(0%)",
                      }}
                      onTransitionEnd={handlePhdSlideEnd}
                    >
                      <div className="w-full shrink-0 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField
                            id="phdTitle"
                            name="phdTitle"
                            label="Τίτλος διδακτορικής διατριβής"
                            type="text"
                            value={phdDraft.phdTitle}
                            onChange={(value) => updatePhdDraft("phdTitle", value)}
                            readOnly={isReadOnly}
                          />
                          <div>
                            <FlowbiteDateField
                              label="Ημερομηνία λήψης"
                              value={phdDraft.phdAcquisitionDate}
                              onChange={(value) =>
                                updatePhdDraft("phdAcquisitionDate", value)
                              }
                              minDate="2011-01-01"
                              maxDate={today}
                              usePortal
                              readOnly={isReadOnly}
                            />
                            <p className="-mt-3 text-xs text-gray-500 italic">
                              Επιτρεπτό εύρος: 01-01-2011 έως {todayDisplay}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <Checkbox
                              id="phdIsFromForeignInstitute"
                              name="phdIsFromForeignInstitute"
                              label="Τίτλος από ίδρυμα εξωτερικού"
                              description=""
                              checked={phdDraft.phdIsFromForeignInstitute}
                              onChange={(value) =>
                                updatePhdDraft("phdIsFromForeignInstitute", value)
                              }
                              readOnly={isReadOnly}
                            />
                          </div>
                        </div>
                      </div>
                      {phdSliding && phdNextDraft && (
                        <div className="w-full shrink-0 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                              id="phdTitle-next"
                              name="phdTitle-next"
                              label="Τίτλος διδακτορικής διατριβής"
                              type="text"
                              value={phdNextDraft.phdTitle}
                              onChange={() => {}}
                              readOnly={isReadOnly}
                            />
                            <div>
                              <FlowbiteDateField
                                label="Ημερομηνία λήψης"
                                value={phdNextDraft.phdAcquisitionDate}
                                onChange={() => {}}
                                minDate="2011-01-01"
                                maxDate={today}
                                usePortal
                                readOnly={isReadOnly}
                              />
                              <p className="-mt-3 text-xs text-gray-500 italic">
                                Επιτρεπτό εύρος: 01-01-2011 έως {todayDisplay}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <Checkbox
                                id="phdIsFromForeignInstitute-next"
                                name="phdIsFromForeignInstitute-next"
                                label="Τίτλος από ίδρυμα εξωτερικού"
                                description=""
                                checked={phdNextDraft.phdIsFromForeignInstitute}
                                onChange={() => {}}
                                readOnly={isReadOnly}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-patras-buccaneer mb-2">Εργασιακή εμπειρία</h3>
                  <div className="rounded-lg border border-patras-buccaneer/10 bg-patras-albescentWhite/30 p-4">
                    <CustomSelect
                      label="Χρόνια μεταδιδακτορικής εργασιακής εμπειρίας (εξαιρείται η διδακτική εμπειρία)"
                      value={
                        additionalForm.workExperience === ""
                          ? ""
                          : String(additionalForm.workExperience)
                      }
                      onChange={(value) => {
                        if (value === "select") {
                          handleAdditionalFieldChange("workExperience", "");
                          return;
                        }
                        handleAdditionalFieldChange(
                          "workExperience",
                          Number(value)
                        );
                      }}
                      options={workExperienceOptions}
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
              </div>
              {!isReadOnly && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={handleSaveAdditional}
                    disabled={savingAdditional}
                    className="inline-flex items-center justify-center bg-patras-buccaneer text-sm text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors disabled:opacity-60"
                  >
                    {savingAdditional ? "Αποθήκευση..." : "Αποθήκευση αλλαγών"}
                  </button>
                </div>
              )}
            </div>
          )}

          {isProfileApplicant && activeSection === "vault" && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              {vaultItems.length === 0 ? (
                <p className="text-gray-500">Δεν υπάρχουν καταχωρημένα δικαιολογητικά.</p>
              ) : (
                <div>
                  {(() => {
                    const groupedDocTypes = new Set([
                      "responsible_declaration",
                      "public_employee_permission",
                      "not_participated_declaration",
                      "eu_citizen_greek_language_certificate",
                      "military",
                      "other",
                    ]);
                    const primaryItems = vaultItems.filter(
                      (item) => !groupedDocTypes.has(item.docType)
                    );
                    const groupedItems = vaultItems.filter((item) =>
                      groupedDocTypes.has(item.docType)
                    );

                    const renderItem = (item) => (
                      <div key={item.key} className="mt-6 first:mt-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="text-sm font-semibold text-patras-buccaneer">
                            {item.label}
                          </div>
                        </div>
                        <div className="rounded-lg border border-patras-buccaneer/10 bg-patras-albescentWhite/30 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-3">
                            {renderFilePills(item.files)}
                            <div className="flex md:justify-end">
                              {!isReadOnly && (
                                <label
                                  className="group inline-flex items-center gap-2 text-xs font-semibold text-patras-buccaneer cursor-pointer relative"
                                >
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.odt"
                                    onChange={(event) => {
                                      const file = event.target.files?.[0];
                                      event.target.value = "";
                                      handleVaultUpload(item.docType, file);
                                    }}
                                  />
                                  <span className="inline-flex items-center gap-1 rounded-full border border-patras-buccaneer/40 bg-patras-albescentWhite/60 px-3 py-1 transition-colors duration-150 hover:bg-patras-buccaneer hover:text-white">
                                    + Προσθήκη
                                  </span>
                                  <span className="absolute right-0 top-full mt-2 w-max rounded-md border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-600 shadow-md opacity-0 translate-y-1 pointer-events-none transition duration-150 group-hover:opacity-100 group-hover:translate-y-0">
                                    PDF, DOC, DOCX, ODT
                                    <br />
                                    Μέγιστο μέγεθος: 5MB
                                  </span>
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );

                    return (
                      <>
                        {primaryItems.map(renderItem)}
                        {groupedItems.map(renderItem)}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {isProfileApplicant && activeSection === "publications" && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <FormDataContext.Provider value={publicationsContextValue}>
                <PublicationsSection readOnly={isReadOnly} />
              </FormDataContext.Provider>
              {!isReadOnly && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={handleSavePublications}
                    disabled={savingPublications}
                    className="inline-flex items-center justify-center bg-patras-buccaneer text-sm text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors disabled:opacity-60"
                  >
                    {savingPublications ? "Αποθήκευση..." : "Αποθήκευση αλλαγών"}
                  </button>
                </div>
              )}
            </div>
          )}
          <TermsModal
            open={isRestrictionsModalOpen}
            onClose={() => setIsRestrictionsModalOpen(false)}
          />
        </section>
      </div>
    </div>
  );
}
