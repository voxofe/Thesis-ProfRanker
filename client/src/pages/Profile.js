import React, { useEffect, useMemo, useRef, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
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
import PhdAbstractField from "../components/PhdAbstractField";
import LoadingIndicator from "../components/LoadingIndicator";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

const PHD_ABSTRACT_MIN_WORDS = 200;
const PHD_ABSTRACT_MAX_WORDS = 1000;
const PHD_KEYWORDS_MIN = 3;
const PHD_KEYWORDS_MAX = 10;

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
    workExperience: "",
  });
  const [phdDraft, setPhdDraft] = useState({
    phdTitle: "",
    phdAcquisitionDate: "",
    phdIsFromForeignInstitute: false,
    phdAbstract: "",
    phdKeywords: [],
  });
  const [phdKeywordInput, setPhdKeywordInput] = useState("");
  const phdKeywordInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAdditional, setSavingAdditional] = useState(false);
  const [savingPublications, setSavingPublications] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isRestrictionsModalOpen, setIsRestrictionsModalOpen] = useState(false);
  const [profilePublications, setProfilePublications] = useState([]);
  const [vaultActionState, setVaultActionState] = useState({});
  const [vaultActionProgress, setVaultActionProgress] = useState({});
  const [pendingUploads, setPendingUploads] = useState({});
  const uploadTimersRef = useRef({});
  const phdDegrees = useMemo(
    () => (Array.isArray(profile?.phdDegrees) ? profile.phdDegrees : []),
    [profile]
  );

  const isAdmin = currentUser?.role === "admin";
  const isAdminViewingOther =
    isAdmin && userId && String(userId) !== String(currentUser?.id);
  const isReadOnly = isAdminViewingOther;

  useEffect(() => {
    return () => {
      Object.values(uploadTimersRef.current).forEach((timerId) => {
        clearInterval(timerId);
      });
      uploadTimersRef.current = {};
    };
  }, []);

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
            phdAbstract: degrees[0]?.abstract || "",
            phdKeywords: degrees[0]?.keywords || [],
          });
        } else {
          setActivePhdIndex(0);
          setPhdDraft({
            phdTitle: "",
            phdAcquisitionDate: "",
            phdIsFromForeignInstitute: false,
            phdAbstract: "",
            phdKeywords: [],
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
            phdAbstract: nextDegree.abstract || "",
            phdKeywords: nextDegree.keywords || [],
          });
        }
      }
      return nextIndex;
    });
  }, [phdDegrees]);


  const isProfileApplicant = profile?.user?.role === "applicant";
  const isProfileVaultUser =
    profile?.user?.role === "applicant" || profile?.user?.role === "guest";
  const today = new Date().toISOString().split("T")[0];
  const todayDisplay = today.split("-").reverse().join("-");
  const phdKeywordCount = Array.isArray(phdDraft.phdKeywords)
    ? phdDraft.phdKeywords.length
    : 0;
  const phdKeywordsTooFew = phdKeywordCount > 0 && phdKeywordCount < PHD_KEYWORDS_MIN;
  const phdKeywordsTooMany = phdKeywordCount > PHD_KEYWORDS_MAX;
  const phdKeywordLimitReached = phdKeywordCount >= PHD_KEYWORDS_MAX;
  const workExperienceOptions = Array.from({ length: 11 }, (_, index) => ({
    value: String(index),
    label: String(index),
  }));
  const canEditIdentity = !isAdminViewingOther && profile?.canEditIdentity !== false;
  const normalizedProfileGender = String(
    profile?.user?.gender || form?.gender || ""
  ).toLowerCase();
  const requiresMilitaryDoc = normalizedProfileGender === "male";
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

  const addPhdKeyword = (value) => {
    const nextValue = String(value || "").trim();
    if (!nextValue) return;
    setPhdDraft((prev) => {
      const existing = Array.isArray(prev.phdKeywords) ? prev.phdKeywords : [];
      if (existing.length >= PHD_KEYWORDS_MAX) {
        return prev;
      }
      const exists = existing.some(
        (item) => String(item).toLowerCase() === nextValue.toLowerCase()
      );
      if (exists) return prev;
      return { ...prev, phdKeywords: [...existing, nextValue] };
    });
  };

  const removePhdKeyword = (value) => {
    setPhdDraft((prev) => ({
      ...prev,
      phdKeywords: (prev.phdKeywords || []).filter(
        (item) => String(item) !== String(value)
      ),
    }));
  };

  const commitPhdKeyword = () => {
    const nextValue = phdKeywordInput.trim();
    if (!nextValue) return;
    addPhdKeyword(nextValue);
    setPhdKeywordInput("");
  };

  const handlePhdKeywordKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitPhdKeyword();
    }
  };

  const clearPhdKeywords = () => {
    updatePhdDraft("phdKeywords", []);
    setPhdKeywordInput("");
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
          phdAbstract: nextDegree.abstract || "",
          phdKeywords: nextDegree.keywords || [],
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
          phdAbstract: nextDegree.abstract || "",
          phdKeywords: nextDegree.keywords || [],
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
    const activeDegree = phdDegrees[activePhdIndex] || null;
    const abstractValue = (phdDraft.phdAbstract || "").trim();
    const keywordsValue = Array.isArray(phdDraft.phdKeywords)
      ? phdDraft.phdKeywords
      : [];
    const wordCount = abstractValue.split(/\s+/).filter(Boolean).length;
    if (activeDegree) {
      if (!abstractValue) {
        showToast({ type: "error", message: "Η περίληψη είναι υποχρεωτική." });
        return;
      }
      if (wordCount < PHD_ABSTRACT_MIN_WORDS) {
        showToast({
          type: "error",
          message: `Η περίληψη πρέπει να έχει τουλάχιστον ${PHD_ABSTRACT_MIN_WORDS} λέξεις.`,
        });
        return;
      }
      if (wordCount > PHD_ABSTRACT_MAX_WORDS) {
        showToast({
          type: "error",
          message: `Η περίληψη δεν μπορεί να ξεπερνά τις ${PHD_ABSTRACT_MAX_WORDS} λέξεις.`,
        });
        return;
      }
      if (keywordsValue.length < PHD_KEYWORDS_MIN) {
        showToast({
          type: "error",
          message: `Οι λέξεις-κλειδιά πρέπει να είναι τουλάχιστον ${PHD_KEYWORDS_MIN}.`,
        });
        return;
      }
      if (keywordsValue.length > PHD_KEYWORDS_MAX) {
        showToast({
          type: "error",
          message: `Οι λέξεις-κλειδιά δεν μπορούν να είναι πάνω από ${PHD_KEYWORDS_MAX}.`,
        });
        return;
      }
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
        workExperience: Number.isNaN(workExperienceValue)
          ? null
          : workExperienceValue,
      },
    };

    if (activeDegree) {
      payload.phdDegreeId = activeDegree.id;
      payload.phdTitle = phdDraft.phdTitle || "";
      payload.phdAcquisitionDate = phdDraft.phdAcquisitionDate || "";
      payload.phdIsFromForeignInstitute = !!phdDraft.phdIsFromForeignInstitute;
      payload.phdAbstract = abstractValue;
      payload.phdKeywords = keywordsValue;
    }

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
          phdTitle: "",
          phdAcquisitionDate: "",
          phdIsFromForeignInstitute: false,
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


  const renderFilePills = (files, docType) => {
    const pendingList = pendingUploads[docType] || [];
    const fileIds = new Set(files.map((file) => file?.id).filter(Boolean));
    const fileNames = new Set(files.map((file) => file?.name).filter(Boolean));
    const visiblePending = pendingList.filter((pending) => {
      if (pending.serverId && fileIds.has(pending.serverId)) return false;
      if (pending.serverName && fileNames.has(pending.serverName)) return false;
      if (pending.name && fileNames.has(pending.name)) return false;
      return true;
    });
    return (
      <div className="flex flex-wrap gap-2">
        {visiblePending.map((pending) => (
          <div
            key={pending.id}
            className="pr-vault-upload-pill inline-flex max-w-[260px] items-center gap-2 rounded-full border border-gray-200 dark:border-[var(--color-border)] px-3 py-1 text-sm text-patras-buccaneer dark:text-[var(--color-text-secondary)] shadow-sm"
          >
            {!pending.uploaded && (
              <span className="pr-vault-upload-base" aria-hidden="true" />
            )}
            {!pending.uploaded && (
              <span
                className="pr-vault-upload-fill"
                aria-hidden="true"
                style={{ width: `${Math.min(100, Math.max(0, pending.progress ?? 0))}%` }}
              />
            )}
            {!pending.uploaded && (
              <span className="relative z-10">
                <svg
                  className="pr-uploading-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M12 16V4" />
                  <path d="M7 9l5-5 5 5" />
                </svg>
              </span>
            )}
            <span className="relative z-10 truncate" title={pending.name}>
              {pending.name}
              {!pending.uploaded && (
                <span className="ml-2 text-xs text-patras-buccaneer/70 dark:text-[var(--color-text-muted)]">
                  {Math.min(100, Math.max(0, pending.progress ?? 0))}%
                </span>
              )}
            </span>
          </div>
        ))}
      {files.map((file) => (
        <VaultFileActions
          key={file.id || file.name}
          file={file}
          onReplace={(selected) => handleVaultReplace(file, selected, docType)}
          onDelete={() => handleVaultDelete(file)}
          onView={() => handleVaultView(file)}
          onDownload={() => handleVaultDownload(file)}
          loadingAction={vaultActionState[file.id] || null}
          actionProgress={vaultActionProgress[file.id]}
          showReplace={!isReadOnly}
          showDelete={!isReadOnly}
        />
      ))}
      </div>
    );
  };

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
          className="text-patras-buccaneer underline hover:text-patras-auChico dark:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-secondary)]"
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
      "Πρωτοκολλημένη αίτηση για έκδοση σχετικής άδειας από το αρμόδιο όργανο για δημοσίους υπαλλήλους",
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
        message:
          "Επιτρέπονται μόνο αρχεία PDF, DOC, DOCX, ODT.",
      });
      return;
    }
    const maxBytes = docType === "phd" ? 30 * 1024 * 1024 : 5 * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      const maxMb = Math.round(maxBytes / (1024 * 1024));
      showToast({
        type: "error",
        message: `Το αρχείο πρέπει να είναι έως ${maxMb}MB.`,
      });
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("docType", docType);

    const uploadVaultFile = (url, data, authToken, onProgress) =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.responseType = "json";
        xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
        xhr.upload.onprogress = onProgress;
        xhr.onload = () => {
          const contentType = xhr.getResponseHeader("Content-Type") || "";
          const isJson = contentType.includes("application/json");
          let payload = xhr.response;
          if (!payload && xhr.responseText) {
            if (isJson) {
              try {
                payload = JSON.parse(xhr.responseText);
              } catch (parseError) {
                payload = null;
              }
            } else {
              payload = xhr.responseText;
            }
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(payload || null);
            return;
          }
          const error = new Error("Upload failed");
          error.response = { data: payload || { error: xhr.responseText } };
          reject(error);
        };
        xhr.onerror = () => {
          reject(new Error("Network error"));
        };
        xhr.send(data);
      });

    const pendingId = `${docType}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const stopUploadTicker = () => {
      const timerId = uploadTimersRef.current[pendingId];
      if (timerId) {
        clearInterval(timerId);
        delete uploadTimersRef.current[pendingId];
      }
    };
    const startUploadTicker = () => {
      if (uploadTimersRef.current[pendingId]) return;
      uploadTimersRef.current[pendingId] = setInterval(() => {
        setPendingUploads((prev) => {
          const list = Array.isArray(prev[docType]) ? prev[docType] : [];
          let updated = false;
          const nextList = list.map((item) => {
            if (item.id !== pendingId) return item;
            const current = Number.isFinite(item.progress) ? item.progress : 0;
            if (current >= 95 || item.uploaded) return item;
            const bump = 2 + Math.round(Math.random() * 4);
            updated = true;
            return { ...item, progress: Math.min(95, current + bump) };
          });
          if (!updated) return prev;
          return { ...prev, [docType]: nextList };
        });
      }, 350);
    };
    let uploadSucceeded = false;
    try {
      setPendingUploads((prev) => {
        const next = { ...prev };
        const list = Array.isArray(next[docType]) ? next[docType] : [];
        next[docType] = [
          ...list,
          {
            id: pendingId,
            name: selectedFile.name || "Αρχείο",
            uploaded: false,
            progress: 0,
          },
        ];
        return next;
      });
      startUploadTicker();
      const createdDoc = await uploadVaultFile(
        `${API_BASE_URL}/api/profile/vault`,
        formData,
        token,
        (event) => {
          const total = event.total || selectedFile.size;
          if (!total) return;
          stopUploadTicker();
          const progress = Math.round((event.loaded / total) * 100);
          setPendingUploads((prev) => {
            const list = Array.isArray(prev[docType]) ? prev[docType] : [];
            let updated = false;
            const nextList = list.map((item) => {
              if (item.id !== pendingId) return item;
              updated = true;
              return { ...item, progress };
            });
            if (!updated) return prev;
            return { ...prev, [docType]: nextList };
          });
        }
      );
      uploadSucceeded = true;
      stopUploadTicker();
      setPendingUploads((prev) => {
        const list = Array.isArray(prev[docType]) ? prev[docType] : [];
        let updated = false;
        const nextList = list.map((item) => {
          if (item.id !== pendingId) return item;
          updated = true;
          return {
            ...item,
            uploaded: true,
            progress: 100,
            serverId: createdDoc?.id,
            serverName: createdDoc?.name,
          };
        });
        if (!updated) return prev;
        return { ...prev, [docType]: nextList };
      });
      if (createdDoc?.id) {
        setProfile((prev) => {
          if (!prev) return prev;
          const vault = prev.documentVault || {};
          const list = Array.isArray(vault[docType]) ? vault[docType] : [];
          if (list.some((item) => item?.id === createdDoc.id)) {
            return prev;
          }
          return {
            ...prev,
            documentVault: {
              ...vault,
              [docType]: [createdDoc, ...list],
            },
          };
        });
        setPendingUploads((prev) => {
          const list = Array.isArray(prev[docType]) ? prev[docType] : [];
          const nextList = list.filter((item) => item.id !== pendingId);
          if (nextList.length === list.length) return prev;
          const next = { ...prev };
          if (nextList.length === 0) {
            delete next[docType];
          } else {
            next[docType] = nextList;
          }
          return next;
        });
      }
      showToast({ type: "success", message: "Το αρχείο προστέθηκε." });
      refreshProfileData();
    } catch (error) {
      stopUploadTicker();
      console.error("Error uploading document:", error);
      showToast({
        type: "error",
        message: error?.response?.data?.error || "Αποτυχία προσθήκης αρχείου.",
      });
    } finally {
      stopUploadTicker();
      if (!uploadSucceeded) {
        setPendingUploads((prev) => {
          const list = Array.isArray(prev[docType]) ? prev[docType] : [];
          const nextList = list.filter((item) => item.id !== pendingId);
          if (nextList.length === list.length) return prev;
          const next = { ...prev };
          if (nextList.length === 0) {
            delete next[docType];
          } else {
            next[docType] = nextList;
          }
          return next;
        });
      }
    }
  };

  useEffect(() => {
    if (!profile?.documentVault) return;
    setPendingUploads((prev) => {
      const vault = profile.documentVault || {};
      let updated = false;
      const next = { ...prev };
      Object.keys(prev).forEach((docType) => {
        const list = Array.isArray(prev[docType]) ? prev[docType] : [];
        const vaultList = Array.isArray(vault[docType]) ? vault[docType] : [];
        const vaultNames = new Set(
          vaultList.map((item) => item?.name).filter(Boolean)
        );
        const remaining = list.filter((item) => !vaultNames.has(item.name));
        if (remaining.length !== list.length) {
          updated = true;
          if (remaining.length === 0) {
            delete next[docType];
          } else {
            next[docType] = remaining;
          }
        }
      });
      return updated ? next : prev;
    });
  }, [profile]);

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

  const handleVaultReplace = async (file, selectedFile, docType) => {
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
    const maxBytes = docType === "phd" ? 30 * 1024 * 1024 : 5 * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      const maxMb = Math.round(maxBytes / (1024 * 1024));
      showToast({
        type: "error",
        message: `Το αρχείο πρέπει να είναι έως ${maxMb}MB.`,
      });
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    const uploadReplaceFile = (url, data, authToken, onProgress) =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.responseType = "json";
        xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
        xhr.upload.onprogress = onProgress;
        xhr.onload = () => {
          const contentType = xhr.getResponseHeader("Content-Type") || "";
          const isJson = contentType.includes("application/json");
          let payload = xhr.response;
          if (!payload && xhr.responseText) {
            if (isJson) {
              try {
                payload = JSON.parse(xhr.responseText);
              } catch (parseError) {
                payload = null;
              }
            } else {
              payload = xhr.responseText;
            }
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(payload || null);
            return;
          }
          const error = new Error("Replace failed");
          error.response = { data: payload || { error: xhr.responseText } };
          reject(error);
        };
        xhr.onerror = () => {
          reject(new Error("Network error"));
        };
        xhr.send(data);
      });

    try {
      setVaultActionState((prev) => ({ ...prev, [file.id]: "replace" }));
      setVaultActionProgress((prev) => ({ ...prev, [file.id]: 0 }));
      await uploadReplaceFile(
        `${API_BASE_URL}/api/profile/vault/${file.id}`,
        formData,
        token,
        (event) => {
          const total = event.total || selectedFile.size;
          if (!total) return;
          const progress = Math.round((event.loaded / total) * 100);
          setVaultActionProgress((prev) => ({ ...prev, [file.id]: progress }));
        }
      );
      setVaultActionProgress((prev) => ({ ...prev, [file.id]: 100 }));
      showToast({ type: "success", message: "Το αρχείο αντικαταστάθηκε." });
      await refreshProfileData();
    } catch (error) {
      console.error("Error replacing document:", error);
      showToast({
        type: "error",
        message:
          error?.response?.data?.error || "Αποτυχία αντικατάστασης αρχείου.",
      });
    } finally {
      setVaultActionState((prev) => {
        if (!(file.id in prev)) return prev;
        const next = { ...prev };
        delete next[file.id];
        return next;
      });
      setVaultActionProgress((prev) => {
        if (!(file.id in prev)) return prev;
        const next = { ...prev };
        delete next[file.id];
        return next;
      });
    }
  };

  const handleVaultDelete = async (file) => {
    if (isReadOnly) return;
    if (!file?.id) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setVaultActionState((prev) => ({ ...prev, [file.id]: "delete" }));
      setVaultActionProgress((prev) => ({ ...prev, [file.id]: 0 }));
      await axios.delete(`${API_BASE_URL}/api/profile/vault/${file.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVaultActionProgress((prev) => ({ ...prev, [file.id]: 100 }));
      showToast({ type: "success", message: "Το αρχείο διαγράφηκε." });
      await refreshProfileData();
    } catch (error) {
      console.error("Error deleting document:", error);
      showToast({
        type: "error",
        message:
          error?.response?.data?.error || "Αποτυχία διαγραφής αρχείου.",
      });
      setVaultActionState((prev) => {
        if (!(file.id in prev)) return prev;
        const next = { ...prev };
        delete next[file.id];
        return next;
      });
      setVaultActionProgress((prev) => {
        if (!(file.id in prev)) return prev;
        const next = { ...prev };
        delete next[file.id];
        return next;
      });
    }
  };

  useEffect(() => {
    if (!profile?.documentVault) return;
    const ids = new Set();
    Object.values(profile.documentVault).forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((item) => {
        if (item?.id) ids.add(String(item.id));
      });
    });
    setVaultActionState((prev) => {
      const keys = Object.keys(prev);
      if (keys.length === 0) return prev;
      let changed = false;
      const next = { ...prev };
      keys.forEach((id) => {
        if (!ids.has(id)) {
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    setVaultActionProgress((prev) => {
      const keys = Object.keys(prev);
      if (keys.length === 0) return prev;
      let changed = false;
      const next = { ...prev };
      keys.forEach((id) => {
        if (!ids.has(id)) {
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [profile]);

  const handleVaultView = async (file) => {
    if (!file?.downloadPath) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      if (file.id) {
        setVaultActionState((prev) => ({ ...prev, [file.id]: "view" }));
      }
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
    } finally {
      if (file?.id) {
        setVaultActionState((prev) => {
          if (!(file.id in prev)) return prev;
          const next = { ...prev };
          delete next[file.id];
          return next;
        });
      }
    }
  };

  const handleVaultDownload = async (file) => {
    if (!file?.downloadPath) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      if (file.id) {
        setVaultActionState((prev) => ({ ...prev, [file.id]: "download" }));
      }
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
    } finally {
      if (file?.id) {
        setVaultActionState((prev) => {
          if (!(file.id in prev)) return prev;
          const next = { ...prev };
          delete next[file.id];
          return next;
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-y-5 pt-5">
        <LoadingIndicator size="sm" textClassName="mt-2 text-gray-600 dark:text-[var(--color-text-secondary)]" />
      </div>
    );
  }

  return (
    <div className="pr-profile-labels max-w-6xl mx-auto px-6">
      <div>
        <h1 className="text-2xl text-center border-b pb-2 mb-2 text-gray-800 dark:text-[var(--color-text-primary)]">
          {isAdminViewingOther ? (
            <>
              Φάκελος χρήστη: <span className="text-lg font-semibold">{`${form.firstName} ${form.lastName}`.trim()}</span>
            </>
          ) : (
            "O φακελός μου"
          )}
        </h1>
      </div>
        <h2 className="text-lg text-center font-semibold text-patras-buccaneer/100 dark:text-[var(--color-text-primary)] py-2">
            {activeSection === "general" && "Γενικά στοιχεία"}
            {activeSection === "additional" && "Πρόσθετα στοιχεία"}
            {activeSection === "vault" && "Αρχεία"}
            {activeSection === "publications" && "Επιστημονικές δημοσιεύσεις"}
        </h2>
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        <aside className="rounded-xl border border-gray-200 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-surface)] p-4 h-fit lg:sticky lg:top-6">
          <nav className="space-y-2 text-sm">
            <button
              type="button"
              onClick={() => setActiveSection("general")}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                activeSection === "general"
                  ? "bg-patras-albescentWhite/80 text-patras-buccaneer border border-patras-buccaneer/20"
                  : "text-gray-700 dark:text-[var(--color-text-secondary)]"
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
                    : "text-gray-700 dark:text-[var(--color-text-secondary)]"
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
                    : "text-gray-700 dark:text-[var(--color-text-secondary)]"
                }`}
              >
                Επιστημονικές δημοσιεύσεις
              </button>
            )}
            {isProfileVaultUser && (
              <button
                type="button"
                onClick={() => setActiveSection("vault")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeSection === "vault"
                    ? "bg-patras-albescentWhite/80 text-patras-buccaneer border border-patras-buccaneer/20"
                    : "text-gray-700 dark:text-[var(--color-text-secondary)]"
                }`}
              >
                Αρχεία
              </button>

            )}
          </nav>

        </aside>

        <section>

          {!isReadOnly && (
            <div className="mb-4 rounded-md border border-gray-200 dark:border-[var(--color-border)] bg-gray-50 dark:bg-[var(--color-bg-muted)] px-4 py-2 text-xs text-gray-600 dark:text-[var(--color-text-secondary)]">
              Οι αλλαγές εδώ δεν επηρεάζουν ήδη υποβληθείσες αιτήσεις.
              Για αλλαγές σε ενεργές αιτήσεις, επεξεργαστείτε τις από την αρχική σελίδα.
            </div>
          )}
          {activeSection === "general" && (
            <div className="bg-white dark:bg-[var(--color-bg-card)] rounded-lg border border-gray-200 dark:border-[var(--color-border)] shadow-sm p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-[var(--color-text-primary)] mb-5">Βασικά</h3>
                  <div className="rounded-lg border border-patras-buccaneer/10 dark:border-[var(--color-border)] bg-patras-albescentWhite/30 dark:bg-[var(--color-bg-surface)] p-4">
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
                        error={formErrors.lastName}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-[var(--color-text-primary)] mb-5">Τηλέφωνα</h3>
                  <div className="rounded-lg border border-patras-buccaneer/10 dark:border-[var(--color-border)] bg-patras-albescentWhite/30 dark:bg-[var(--color-bg-surface)] p-4">
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
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-[var(--color-text-primary)] mb-5">Διεύθυνση</h3>
                  <div className="rounded-lg border border-patras-buccaneer/10 dark:border-[var(--color-border)] bg-patras-albescentWhite/30 dark:bg-[var(--color-bg-surface)] p-4">
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
            <div className="bg-white dark:bg-[var(--color-bg-card)] rounded-lg border border-gray-200 dark:border-[var(--color-border)] shadow-sm p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-[var(--color-text-primary)] mb-5">Ιδιότητες υποψηφίου</h3>
                  <div className="rounded-lg border border-patras-buccaneer/10 dark:border-[var(--color-border)] bg-patras-albescentWhite/30 dark:bg-[var(--color-bg-surface)] p-4">
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
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-[var(--color-text-primary)] mb-5">
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
                        <span className="text-xs text-gray-500 dark:text-[var(--color-text-muted)]">
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
                    className="rounded-lg border border-patras-buccaneer/10 dark:border-[var(--color-border)] bg-patras-albescentWhite/30 dark:bg-[var(--color-bg-surface)] overflow-x-hidden overflow-y-visible"
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
                            inputTitle={
                              (phdDraft.phdTitle || "").trim().length > 60
                                ? (phdDraft.phdTitle || "").trim()
                                : ""
                            }
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
                            <p className="-mt-3 text-xs text-gray-500 dark:text-[var(--color-text-muted)] italic">
                              Επιτρεπτό εύρος: 01-01-2011 έως {todayDisplay}
                            </p>
                          </div>
                          <div className="md:col-span-2 [&_textarea]:bg-white [&_textarea]:dark:bg-[var(--color-bg-card)] [&_textarea]:dark:outline-[var(--color-border-accent)] [&_textarea]:focus:outline-patras-buccaneer [&_textarea]:dark:focus:outline-[var(--color-primary)] [&_textarea]:focus:ring-patras-buccaneer [&_textarea]:dark:focus:ring-[var(--color-primary)]">
                            <PhdAbstractField
                              id="phdAbstract"
                              name="phdAbstract"
                              value={phdDraft.phdAbstract}
                              onChange={(value) => updatePhdDraft("phdAbstract", value)}
                              minWords={PHD_ABSTRACT_MIN_WORDS}
                              maxWords={PHD_ABSTRACT_MAX_WORDS}
                              placeholder="Γράψτε μια σύντομη περίληψη της διατριβής"
                              readOnly={isReadOnly}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label
                                htmlFor="phdKeywords"
                                className="block text-sm/6 font-medium text-gray-900 dark:text-[var(--color-text-primary)]"
                              >
                                Λέξεις-κλειδιά
                              </label>
                            </div>
                            <div
                              className="relative mt-2 flex w-full flex-wrap items-center gap-2 rounded-md bg-white dark:bg-[var(--color-bg-card)] px-3 py-3 text-base sm:text-sm/6 outline outline-1 -outline-offset-1 outline-patras-buccaneer focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-patras-buccaneer focus-within:ring-1 focus-within:ring-offset-0 focus-within:ring-patras-buccaneer"
                              onClick={(event) => {
                                if (event.target.closest("button") || event.target.tagName === "INPUT") {
                                  return;
                                }
                                phdKeywordInputRef.current?.focus();
                              }}
                            >
                              {(phdDraft.phdKeywords || []).map((keyword) => (
                                <span
                                  key={keyword}
                                  className="inline-flex items-center gap-1 rounded-full bg-patras-goldSand/30 px-3 py-1 text-sm text-gray-800 dark:text-[var(--color-text-primary)]"
                                >
                                  {keyword}
                                  {!isReadOnly && (
                                    <button
                                      type="button"
                                      onClick={() => removePhdKeyword(keyword)}
                                      className="text-gray-500 dark:text-[var(--color-text-muted)] hover:text-gray-800 dark:text-[var(--color-text-primary)]"
                                      aria-label={`Αφαίρεση λέξης-κλειδιού ${keyword}`}
                                    >
                                      ×
                                    </button>
                                  )}
                                </span>
                              ))}
                              {!isReadOnly && !phdKeywordLimitReached && (
                                <input
                                  id="phdKeywords"
                                  name="phdKeywords"
                                  type="text"
                                  value={phdKeywordInput}
                                  onChange={(e) => setPhdKeywordInput(e.target.value)}
                                  onKeyDown={handlePhdKeywordKeyDown}
                                  onBlur={commitPhdKeyword}
                                  placeholder=""
                                  className="flex-none min-w-[4ch] max-w-full border-0 p-0 text-sm text-gray-900 dark:bg-[var(--color-bg-card)] dark:text-[var(--color-text-primary)] placeholder:text-gray-400 dark:text-[var(--color-text-muted)] outline-none focus:ring-0"
                                  style={{ width: `${Math.max(8, phdKeywordInput.length + 1)}ch` }}
                                  ref={phdKeywordInputRef}
                                />
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm text-gray-500 dark:text-[var(--color-text-muted)]">
                                Πληκτρολογήστε και πατήστε Enter ή κόμμα για να προσθέσετε λέξη-κλειδί.
                              </p>
                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={clearPhdKeywords}
                                  disabled={phdKeywordCount === 0}
                                  className="inline-flex items-center gap-1 rounded-md border border-patras-buccaneer/30 bg-patras-albescentWhite/30 px-3 py-1 text-sm text-patras-buccaneer hover:bg-patras-albescentWhite disabled:cursor-not-allowed disabled:border-gray-200 dark:border-[var(--color-border)] disabled:bg-gray-100 dark:bg-[var(--color-bg-surface)] dark:hover:bg-[var(--color-bg-muted)] disabled:text-gray-400 dark:text-[var(--color-text-muted)]"
                                  aria-label="Καθαρισμός λέξεων-κλειδιών"
                                  title="Καθαρισμός"
                                >
                                  <span>Καθαρισμός</span>
                                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                                </button>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-[var(--color-text-muted)]">
                              {phdKeywordCount}/{PHD_KEYWORDS_MAX} λέξεις-κλειδιά
                            </p>
                            {(phdKeywordsTooFew || phdKeywordsTooMany) && (
                              <p className="mt-1 text-xs text-red-600">
                                Επιτρέπονται {PHD_KEYWORDS_MIN} έως {PHD_KEYWORDS_MAX} λέξεις-κλειδιά.
                              </p>
                            )}
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
                              inputTitle={
                                (phdNextDraft.phdTitle || "").trim().length > 60
                                  ? (phdNextDraft.phdTitle || "").trim()
                                  : ""
                              }
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
                              <p className="-mt-3 text-xs text-gray-500 dark:text-[var(--color-text-muted)] italic">
                                Επιτρεπτό εύρος: 01-01-2011 έως {todayDisplay}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <label
                                htmlFor="phdAbstract-next"
                                className="block text-sm/6 font-medium text-gray-900 dark:text-[var(--color-text-primary)]"
                              >
                                Περίληψη διδακτορικής διατριβής
                              </label>
                              <div className="mt-2">
                                <textarea
                                  id="phdAbstract-next"
                                  name="phdAbstract-next"
                                  rows={12}
                                  value={phdNextDraft.phdAbstract || ""}
                                  onChange={() => {}}
                                  className="block w-full rounded-md bg-white dark:bg-[var(--color-bg-card)] px-3 py-2 text-sm text-gray-900 dark:text-[var(--color-text-primary)] outline outline-1 -outline-offset-1 outline-patras-buccaneer dark:outline-[var(--color-border-accent)] placeholder:text-gray-400 dark:placeholder:text-[var(--color-text-muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-patras-buccaneer dark:focus:outline-[var(--color-primary)] focus:ring-patras-buccaneer dark:focus:ring-[var(--color-primary)]"
                                  readOnly
                                />
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <label
                                htmlFor="phdKeywords-next"
                                className="block text-sm/6 font-medium text-gray-900 dark:text-[var(--color-text-primary)]"
                              >
                                Λέξεις-κλειδιά
                              </label>
                              <div className="relative mt-2 flex w-full flex-wrap items-center gap-2 rounded-md bg-white dark:bg-[var(--color-bg-card)] px-3 py-3 text-base sm:text-sm/6 outline outline-1 -outline-offset-1 outline-patras-buccaneer focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-patras-buccaneer focus-within:ring-1 focus-within:ring-offset-0 focus-within:ring-patras-buccaneer">
                                {(phdNextDraft.phdKeywords || []).map((keyword) => (
                                  <span
                                    key={keyword}
                                    className="inline-flex items-center gap-1 rounded-full bg-patras-goldSand/30 px-3 py-1 text-sm text-gray-800 dark:text-[var(--color-text-primary)]"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
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
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-[var(--color-text-primary)] mb-5">Εργασιακή εμπειρία</h3>
                  <div className="rounded-lg border border-patras-buccaneer/10 dark:border-[var(--color-border)] bg-patras-albescentWhite/30 dark:bg-[var(--color-bg-surface)] p-4">
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

          {isProfileVaultUser && activeSection === "vault" && (
            <div className="bg-white dark:bg-[var(--color-bg-card)] rounded-lg border border-gray-200 dark:border-[var(--color-border)] shadow-sm p-6">
              {vaultItems.length === 0 ? (
                <p className="text-gray-500 dark:text-[var(--color-text-muted)]">Δεν υπάρχουν καταχωρημένα δικαιολογητικά.</p>
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
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm/6 font-semibold text-gray-900 dark:text-[var(--color-text-primary)] mb-5">
                            {item.label}
                          </div>
                        </div>
                        <div className="rounded-lg border border-patras-buccaneer/10 dark:border-[var(--color-border)] bg-patras-albescentWhite/30 dark:bg-[var(--color-bg-surface)] p-4">
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-3">
                            {renderFilePills(item.files, item.docType)}
                            <div className="flex md:justify-end">
                              {!isReadOnly && (
                                <label
                                  className="group inline-flex items-center gap-2 text-sm font-semibold text-patras-buccaneer cursor-pointer relative"
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
                                  <span className="inline-flex items-center gap-1 rounded-full border border-patras-buccaneer/40 bg-patras-albescentWhite/60 px-3 py-1 transition-colors duration-150 hover:bg-patras-buccaneer hover:text-white dark:bg-patras-buccaneer dark:text-white dark:hover:bg-[var(--color-primary-hover)]">
                                    + Προσθήκη
                                  </span>
                                  <span className="absolute right-0 top-full mt-2 w-max rounded-md border border-gray-200 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-card)] px-3 py-2 text-[11px] text-gray-600 dark:text-[var(--color-text-secondary)] shadow-md opacity-0 translate-y-1 pointer-events-none transition duration-150 group-hover:opacity-100 group-hover:translate-y-0">
                                    {item.docType === "phd" ? "PDF, DOC, DOCX, ODT" : "PDF, DOC, DOCX, ODT"}
                                    <br />
                                    Μέγιστο μέγεθος: {item.docType === "phd" ? "30MB" : "5MB"}
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
            <div className="bg-white dark:bg-[var(--color-bg-card)] rounded-lg border border-gray-200 dark:border-[var(--color-border)] shadow-sm p-6">
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
