import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PublicationsDrawer from "../components/PublicationsDrawer";
import CoursesDrawer from "../components/CoursesDrawer";
import VaultFileActions from "../components/VaultFileActions";
import PhdDetailsModal from "../components/PhdDetailsModal";
import CoursePlanDetailsModal from "../components/CoursePlanDetailsModal";
import TooltipGray from "../components/TooltipGray";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePositions } from "../contexts/PositionsContext";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

const POINTS_MAX = {
  coursePlanRelevancePoints: 25,
  courseMaterialStructurePoints: 5,
  thesisRelevancePoints: 20,
  publicationPoints: 20,
  workExperiencePoints: 10,
  notPastProgramPoints: 16,
  totalPoints: 96,
};

const formatPoints = (value, maxValue) => {
  if (value === null || value === undefined) return "—";
  if (!maxValue) return <span className="font-semibold">{value}</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-semibold">{value}</span>
      <span>/</span>
      <span>{maxValue}</span>
    </span>
  );
};

const thesisRelevanceLabel = (score) => {
  if (score === null || score === undefined) return "";
  if (score <= 4) return "Πολύ χαμηλή συνάφεια";
  if (score <= 8) return "Χαμηλή συνάφεια";
  if (score <= 12) return "Μέτρια συνάφεια";
  if (score <= 16) return "Υψηλή συνάφεια";
  return "Πολύ υψηλή συνάφεια";
};

const thesisRelevanceRanges = [
  { min: 0, max: 4, label: "Πολύ χαμηλή συνάφεια" },
  { min: 5, max: 8, label: "Χαμηλή συνάφεια" },
  { min: 9, max: 12, label: "Μέτρια συνάφεια" },
  { min: 13, max: 16, label: "Υψηλή συνάφεια" },
  { min: 17, max: 20, label: "Πολύ υψηλή συνάφεια" },
];

const coursePlanRelevanceRanges = [
  { min: 0, max: 5, label: "Πολύ χαμηλή συνάφεια" },
  { min: 6, max: 10, label: "Χαμηλή συνάφεια" },
  { min: 11, max: 15, label: "Μέτρια συνάφεια" },
  { min: 16, max: 20, label: "Υψηλή συνάφεια" },
  { min: 21, max: 25, label: "Πολύ υψηλή συνάφεια" },
];

const renderThesisRelevanceTooltip = (score) => {
  if (score === null || score === undefined) return null;
  return (
    <div className="text-xs text-gray-800">
      {thesisRelevanceRanges.map((range) => {
        const isActive = score >= range.min && score <= range.max;
        return (
          <div key={`${range.min}-${range.max}`} className={isActive ? "font-semibold" : ""}>
            {range.min}-{range.max}: {range.label}
          </div>
        );
      })}
    </div>
  );
};

const renderCoursePlanRelevanceTooltip = (score) => {
  if (score === null || score === undefined) return null;
  return (
    <div className="text-xs text-gray-800">
      {coursePlanRelevanceRanges.map((range) => {
        const isActive = score >= range.min && score <= range.max;
        return (
          <div key={`${range.min}-${range.max}`} className={isActive ? "font-semibold" : ""}>
            {range.min}-{range.max}: {range.label}
          </div>
        );
      })}
    </div>
  );
};

const AiIndicatorIcon = ({ className = "h-4 w-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3v3" />
    <rect x="5" y="6" width="14" height="12" rx="3" />
    <circle cx="9.5" cy="12" r="1" />
    <circle cx="14.5" cy="12" r="1" />
    <path d="M9 15h6" />
    <path d="M3 10h2" />
    <path d="M19 10h2" />
  </svg>
);

export default function ApplicationScore() {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const { positions = [] } = usePositions();
  const [applicantData, setApplicantData] = useState();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("application");
  const [docActionState, setDocActionState] = useState({});
  const [isPhdDetailsOpen, setIsPhdDetailsOpen] = useState(false);
  const [isCoursePlanDetailsOpen, setIsCoursePlanDetailsOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const editApplicationId = id;
  const isAdmin = currentUser?.role === "admin";

  const applicantName = useMemo(() => {
    const firstName = applicantData?.firstName || applicantData?.user?.firstName || "";
    const lastName = applicantData?.lastName || applicantData?.user?.lastName || "";
    return `${firstName} ${lastName}`.trim();
  }, [applicantData]);

  // const fmtDate = (d) => {
  //   if (!d) return "";
  //   const dt = typeof d === "string" ? new Date(d) : d;
  //   return dt.toLocaleDateString("el-GR", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   });
  // };

  useEffect(() => {
    if (id && currentUser) {
      setLoading(true);
      const token = localStorage.getItem("token");
      axios
        .get(`${API_BASE_URL}/api/applicant/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setApplicantData(res.data))
        .catch((err) => console.error("Error fetching applicant data:", err))
        .finally(() => setLoading(false));
    }
  }, [id, currentUser]);

  // Try to resolve position info (school, courses) by scientificField name (fallback to data if present)
  const matchedPosition = useMemo(() => {
    const sf = applicantData?.scientificField;
    if (!sf) return null;
    return positions.find((p) => p.scientificField === sf) || null;
  }, [positions, applicantData?.scientificField]);

  // Normalize to DD-MM-YYYY (accepts "DD-MM-YYYY", "DD-MM-YYYY HH:MM", ISO strings, or Date)
  const toDDMMYYYY = (v) => {
    if (!v) return "";
    if (typeof v === "string") {
      const m = v.match(/^(\d{2})-(\d{2})-(\d{4})/);
      if (m) return `${m[1]}-${m[2]}-${m[3]}`; // already formatted, strip time if any
      const d = new Date(v);
      if (!isNaN(d)) {
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      }
      return v;
    }
    if (v instanceof Date && !isNaN(v)) {
      const dd = String(v.getDate()).padStart(2, "0");
      const mm = String(v.getMonth() + 1).padStart(2, "0");
      const yyyy = v.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    return "—";
  };

  const toDDMMYYYYHHMM = (dateStr, timeStr) => {
    if (!dateStr) return "";
    const base = toDDMMYYYY(dateStr);
    const embeddedTime = typeof dateStr === "string" ? dateStr.match(/\b(\d{2}:\d{2})\b/)?.[1] : "";
    const rawTime = timeStr || embeddedTime || "00:00";
    const [hh, mm] = String(rawTime).split(":");
    const padded = `${String(hh || "0").padStart(2, "0")}:${String(mm || "0").padStart(2, "0")}`;
    return `${base} ${padded}`;
  };

  const getTimeZoneOffset = (date, timeZone) => {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = dtf.formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const asUTC = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second)
    );
    return asUTC - date.getTime();
  };

  const buildTimeInZone = (dateStr, timeStr, timeZone) => {
    if (!dateStr) return null;
    const match = String(dateStr).match(/^(\d{2})-(\d{2})-(\d{4})/);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    const [hour, minute] = String(timeStr || "00:00").split(":");
    const utcGuess = new Date(
      Date.UTC(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd),
        Number(hour || 0),
        Number(minute || 0)
      )
    );
    const offset = getTimeZoneOffset(utcGuess, timeZone);
    return new Date(utcGuess.getTime() - offset);
  };

  const parseDDMMYYYYToDate = (value, timeValue) => {
    return buildTimeInZone(value, timeValue, "Europe/Athens");
  };

  const schoolName = applicantData?.school || matchedPosition?.school || "—";
  const departmentName = applicantData?.department || matchedPosition?.department || "—";
  const phdTitle = applicantData?.phdTitle || "—";
  const phdAbstract = applicantData?.phdAbstract || "";
  const phdKeywords = applicantData?.phdKeywords || [];
  const applicantGender = String(
    applicantData?.gender || applicantData?.user?.gender || ""
  ).toLowerCase();
  const requiresMilitaryDoc = applicantGender === "male";

  const courses = useMemo(() => {
    if (Array.isArray(applicantData?.courses) && applicantData.courses.length)
      return applicantData.courses;
    if (Array.isArray(matchedPosition?.courses)) return matchedPosition.courses;
    return [];
  }, [applicantData?.courses, matchedPosition?.courses]);

  // Prefer server-formatted fields from views.py
  const startDate = applicantData?.positionStartDate || matchedPosition?.startDate || "";
  const endDate = applicantData?.positionEndDate || matchedPosition?.endDate || "";
  const startTime = applicantData?.positionStartTime || matchedPosition?.startTime || "";
  const endTime = applicantData?.positionEndTime || matchedPosition?.endTime || "";
  const submitDate =
    applicantData?.submitDate ||
    applicantData?.submittedAt ||
    applicantData?.submissionDate ||
    "";

  const isPositionActive = (() => {
    const now = new Date();
    const start = parseDDMMYYYYToDate(startDate, startTime);
    const end = parseDDMMYYYYToDate(endDate, endTime);
    if (start && end) return now >= start && now <= end;
    if (end) return now <= end;
    return false;
  })();

  const canEditApplication =
    isPositionActive &&
    currentUser?.role === "applicant" &&
    String(currentUser?.id) === String(applicantData?.id);

  const academicYear = "2021-2022";
  const documentItems = [
    {
      key: "cv",
      label: "Βιογραφικό σημείωμα",
      value: applicantData?.documents?.cv,
    },
    {
      key: "bioSupportingDocuments",
      label: "Εγγράφα που τεκμηριώνουν τα διαλαμβανόμενα στο βιογραφικό",
      value: applicantData?.documents?.bioSupportingDocuments || [],
      isMulti: true,
    },
    {
      key: "coursePlan",
      label: "Σχεδιάγραμμα διδασκαλίας",
      value: applicantData?.documents?.coursePlan,
    },
    {
      key: "phd",
      label: "Διδακτορικό δίπλωμα",
      value: applicantData?.documents?.phd,
    },
    {
      key: "doatap",
      label: "Έγγραφο αναγνώρισης ΔΟΑΤΑΠ",
      value: applicantData?.documents?.doatap,
    },
    {
      key: "employmentCertificates",
      label: "Βεβαιώσεις προϋπηρεσίας από τον Φορέα / Συμβάσεις ως τεκμήρια μεταδιδακτορικής εργασιακής εμπειρίας (εξαιρείται η διδακτική εμπειρία)",
      value: applicantData?.documents?.employmentCertificates || [],
      isMulti: true,
    },
    {
      key: "publicEmployeePermission",
      label: "Πρωτοκολλημένη αίτηση για έκδοση σχετικής άδειας από το αρμόδιο όργανο για δημοσίους υπαλλήλους",
      value: applicantData?.documents?.publicEmployeePermission,
    },
    {
      key: "euCitizenGreekLanguageCertificate",
      label: "Πιστοποιητικό ελληνομάθειας Δ΄ επιπέδου από το Κέντρο Ελληνικής Γλώσσας",
      value: applicantData?.documents?.euCitizenGreekLanguageCertificate,
    },
    {
      key: "notParticipatedDeclaration",
      label: "Υπεύθυνη δήλωση μη προηγούμενης συμμετοχής",
      value: applicantData?.documents?.notParticipatedDeclaration,
    },
    ...(requiresMilitaryDoc
      ? [
          {
            key: "military",
            label: `Υπεύθυνη δήλωση εκπλήρωσης στρατιωτικών υποχρεώσεων ή νόμιμης απαλλαγής από αυτές ή αναβολής για το ακαδημαϊκό έτος ${academicYear}`,
            value: applicantData?.documents?.military,
          },
        ]
      : []),
    {
      key: "responsibleDeclaration",
      label: "Υπεύθυνη δήλωση σχετικά με τους περιορισμούς της Πράξης",
      value: applicantData?.documents?.responsibleDeclaration,
    },
  ];

  const buildDownloadUrl = (doc) => {
    if (!doc) return "";
    if (doc.downloadPath) return `${API_BASE_URL}${doc.downloadPath}`;
    return doc.downloadUrl || doc.url || "";
  };

  const hasDoc = (doc) => Boolean(doc?.downloadPath || doc?.downloadUrl || doc?.url);

  const applicationDocuments = useMemo(() => {
    return documentItems
      .map((item) => {
        if (item.isMulti) {
          const docs = Array.isArray(item.value)
            ? item.value.filter((doc) => hasDoc(doc))
            : [];
          return { ...item, docs };
        }
        const docs = item.value && hasDoc(item.value) ? [item.value] : [];
        return { ...item, docs };
      })
      .filter((item) => item.docs.length > 0);
  }, [documentItems]);

  const setDocAction = (key, action) => {
    if (!key) return;
    setDocActionState((prev) => ({ ...prev, [key]: action }));
  };

  const clearDocAction = (key) => {
    if (!key) return;
    setDocActionState((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleDownload = async (url, name, key) => {
    if (!url) return;
    try {
      setDocAction(key, "download");
      const token = localStorage.getItem("token");
      const response = await axios.get(url, {
        responseType: "blob",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading document:", error);
    } finally {
      clearDocAction(key);
    }
  };

  const handleView = async (url, key) => {
    if (!url) return;
    try {
      setDocAction(key, "view");
      const viewUrl = url.includes("?") ? `${url}&inline=1` : `${url}?inline=1`;
      const token = localStorage.getItem("token");
      const response = await axios.get(viewUrl, {
        responseType: "blob",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const blobUrl = window.URL.createObjectURL(response.data);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error viewing document:", error);
    } finally {
      clearDocAction(key);
    }
  };

  const navigate = useNavigate();

  const isPositionCurrentlyActive = () => {
    const now = new Date();
    const start = parseDDMMYYYYToDate(startDate, startTime);
    const end = parseDDMMYYYYToDate(endDate, endTime);
    if (start && end) return now >= start && now <= end;
    if (end) return now <= end;
    return false;
  };

  const handleEditClick = () => {
    if (!isPositionCurrentlyActive()) {
      window.alert(
        "Η περίοδος αιτήσεων για αυτή τη θέση έχει ολοκληρωθεί. Δεν επιτρέπονται πια επεξεργασία ή διαγραφή. Η σελίδα θα ανανεωθεί."
      );
      window.location.reload();
      return;
    }
    navigate(`/form?mode=edit&applicationId=${editApplicationId}`);
  };

  const handleDeleteApplication = async () => {
    if (deleting) return;
    if (!isPositionCurrentlyActive()) {
      window.alert(
        "Η περίοδος αιτήσεων για αυτή τη θέση έχει ολοκληρωθεί. Δεν επιτρέπονται πια επεξεργασία ή διαγραφή. Η σελίδα θα ανανεωθεί."
      );
      window.location.reload();
      return;
    }
    const confirmed = window.confirm("Θέλετε σίγουρα να διαγράψετε αυτή την αίτηση;");
    if (!confirmed) return;
    const token = localStorage.getItem("token");
    if (!token || !editApplicationId) return;

    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/applications/${editApplicationId}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/my-applications");
    } catch (error) {
      console.error("Error deleting application:", error);
    } finally {
      setDeleting(false);
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
    <div className="grid grid-cols-1 gap-y-5 pt-0">
      <h1 className="text-2xl text-center border-b pb-2 mb-1 text-gray-800">
        {isAdmin && applicantName ? (
          <>
            Αίτηση & Βαθμολογία: <span className="text-lg font-semibold">{applicantName}
            {applicantData?.scientificField ? ` - ${applicantData.scientificField}` : ""}
            </span>
          </>
        ) : (
          "Αίτηση & Βαθμολογία"
        )}
      </h1>
      {canEditApplication && (
        <div className="mb-6 mx-auto w-full max-w-2xl rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3">
          <button
            type="button"
            onClick={() => setIsEditDrawerOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-3 text-patras-buccaneer"
          >
            <span className="text-sm text-center flex-1">
              Μπορείτε να επεξεργαστείτε ή να διαγράψετε την αίτηση έως{" "}
              <span className="font-semibold">
                {toDDMMYYYYHHMM(endDate, endTime) || "—"}
              </span>
              .
            </span>
            <span className="text-lg">{isEditDrawerOpen ? "▼" : "\u25B6\uFE0E"}</span>
          </button>
          {isEditDrawerOpen && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Link
                to="#"
                onClick={(event) => {
                  event.preventDefault();
                  handleEditClick();
                }}
                className="inline-flex shrink-0 items-center justify-center rounded-md bg-patras-buccaneer px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-patras-sanguineBrown"
              >
                Επεξεργασία αίτησης
              </Link>
              <button
                type="button"
                onClick={handleDeleteApplication}
                disabled={deleting}
                className="inline-flex shrink-0 items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Διαγραφή αίτησης
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-full border border-patras-buccaneer/40 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("application")}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
              activeTab === "application"
                ? "bg-patras-buccaneer text-white"
                : "text-patras-buccaneer hover:bg-patras-albescentWhite"
            }`}
          >
            Αίτηση
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("score")}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
              activeTab === "score"
                ? "bg-patras-buccaneer text-white"
                : "text-patras-buccaneer hover:bg-patras-albescentWhite"
            }`}
          >
            Βαθμολογία
          </button>
        </div>
      </div>
      
      {activeTab === "application" ? (
        
        <div>
           <h1 className="text-xl font-light mb-3">Στοιχεία θέσης</h1>
            <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50 mb-5">
              <table className="min-w-full bg-white/25">
                <thead className="bg-patras-buccaneer">
                  <tr>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Σχολή
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Τμήμα
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Επιστημονικό πεδίο
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Έναρξη αιτήσεων
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Λήξη αιτήσεων
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Υποβολή αίτησης
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">
                      Μαθήματα
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle border-r border-patras-albescentWhite">
                      {schoolName}
                    </td>
                    <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle border-r border-patras-albescentWhite">
                      {departmentName}
                    </td>
                    <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle border-r border-patras-albescentWhite font-semibold">
                      {applicantData?.scientificField || "—"}
                    </td>
                    <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                      {toDDMMYYYYHHMM(startDate, startTime)}
                    </td>
                    <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                      {toDDMMYYYYHHMM(endDate, endTime)}
                    </td>
                    <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                      {toDDMMYYYYHHMM(submitDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center align-middle">
                      <CoursesDrawer
                        courses={courses}
                        scientificField={applicantData?.scientificField || matchedPosition?.scientificField}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          <h1 className="text-xl font-light mb-3">Στοιχεία υποψηφίου</h1>
          <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50 mb-5">
            <table className="min-w-full bg-white/25">
              <thead className="bg-patras-buccaneer">
                <tr>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    Όνομα
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    Επώνυμο
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    Διδακτορικός τίτλος
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    Ημερομηνία λήψης διδακτορικού τίτλου
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">
                    Mεταδιδακτορική εργασιακή εμπειρία
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-l border-patras-albescentWhite">
                    Σχεδιάγραμμα διδασκαλίας
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite font-semibold">
                    {applicantData?.firstName}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite font-semibold">
                    {applicantData?.lastName}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                    <button
                      type="button"
                      onClick={() => setIsPhdDetailsOpen(true)}
                      className="underline underline-offset-2 text-patras-buccaneer hover:text-patras-sanguineBrown"
                    >
                      {phdTitle}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                    {toDDMMYYYY(applicantData?.phdAcquisitionDate)}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer text-center align-middle">
                    {applicantData?.workExperience
                      ? `${applicantData?.workExperience} ${
                          applicantData?.workExperience === 1
                            ? "χρόνος"
                            : "χρόνια"
                        }`
                      : "Καμία"}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-l border-patras-albescentWhite whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setIsCoursePlanDetailsOpen(true)}
                      className="bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors"
                    >
                      Προβολή
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

           

            <h1 className="text-xl font-light mb-3">Υποβληθέντα δικαιολογητικά</h1>
            <div className="relative overflow-visible shadow-md rounded-lg border border-patras-capePalliser/50 mb-5">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white/25">
                <thead className="bg-patras-buccaneer">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Έγγραφο
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Αρχείο
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-patras-cameo">
                  {applicationDocuments.map((doc) => (
                    <tr key={doc.key}>
                      <td className="px-6 py-4 text-patras-buccaneer border-r border-patras-albescentWhite">
                        {doc.label}
                      </td>
                      <td className="px-6 py-4 text-patras-buccaneer">
                        <div className="flex flex-wrap gap-2">
                          {doc.docs.map((file, index) => {
                            const docKey = file?.id ? `id-${file.id}` : `name-${file?.name || index}`;
                            return (
                            <VaultFileActions
                              key={`${doc.key}-${file.id || index}`}
                              file={{ name: file?.name || "Έγγραφο" }}
                              onView={() => {
                                const viewUrl = buildDownloadUrl(file);
                                handleView(viewUrl, docKey);
                              }}
                              onDownload={() => {
                                const downloadUrl = buildDownloadUrl(file);
                                handleDownload(downloadUrl, file?.name, docKey);
                              }}
                              loadingAction={docActionState[docKey] || null}
                              showReplace={false}
                              showDelete={false}
                            />
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
          </div>
                ) : (
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h1 className="text-xl font-light">Αξιολόγηση αίτησης</h1>
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-patras-albescentWhite text-patras-buccaneer">
                          <AiIndicatorIcon className="h-3.5 w-3.5" />
                        </span>
                        <span>Κριτήρια των οποίων ο υπολογισμός έγινε με χρήση εργαλείων AI/LLM</span>
                      </span>
                    </div>
                    <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50">
                      
                      <table className="min-w-full bg-white/50">
                        <thead className="bg-patras-buccaneer">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                              Κριτήριο
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                              Βαθμολόγηση
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-patras-cameo">
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer">
                              Συνάφεια σχεδιαγράμματος διδασκαλίας και καινοτόμων
                              μεθοδολογιών/θεωριών & βιβλιογραφίας με την περιγραφή του
                              συνόλου των μαθημάτων του Επιστημονικού πεδίου
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer">
                              <span className="inline-flex items-center justify-center gap-2">
                                {formatPoints(
                                  applicantData?.coursePlanRelevancePoints,
                                  POINTS_MAX.coursePlanRelevancePoints
                                )}
                                {applicantData?.coursePlanRelevancePoints !== null &&
                                applicantData?.coursePlanRelevancePoints !== undefined ? (
                                  <TooltipGray
                                    content={renderCoursePlanRelevanceTooltip(applicantData?.coursePlanRelevancePoints)}
                                    className="w-auto max-w-xs whitespace-nowrap"
                                  >
                                    <span
                                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-patras-albescentWhite text-patras-buccaneer cursor-help"
                                      aria-label="Σημείωση συνάφειας σχεδιαγράμματος διδασκαλίας"
                                    >
                                      <AiIndicatorIcon className="h-3.5 w-3.5" />
                                    </span>
                                  </TooltipGray>
                                ) : null}
                              </span>
                            </td>
                          </tr>
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer">
                              Δομή, οργάνωση, κατανομή ύλης
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer">
                              {formatPoints(
                                applicantData?.courseMaterialStructurePoints,
                                POINTS_MAX.courseMaterialStructurePoints
                              )}
                            </td>
                          </tr>
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer">
                              Συνάφεια διδακτορικής διατριβής/δημοσιευμένου έργου με το
                              επιστημονικό πεδίο
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer">
                              <span className="inline-flex items-center justify-center gap-2">
                                {formatPoints(
                                  applicantData?.thesisRelevancePoints,
                                  POINTS_MAX.thesisRelevancePoints
                                )}
                                {applicantData?.thesisRelevancePoints !== null &&
                                applicantData?.thesisRelevancePoints !== undefined ? (
                                  <TooltipGray
                                    content={renderThesisRelevanceTooltip(applicantData?.thesisRelevancePoints)}
                                    className="w-auto max-w-xs whitespace-nowrap"
                                  >
                                    <span
                                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-patras-albescentWhite text-patras-buccaneer cursor-help"
                                      aria-label="Σημείωση συνάφειας διδακτορικής διατριβής"
                                    >
                                      <AiIndicatorIcon className="h-3.5 w-3.5" />
                                    </span>
                                  </TooltipGray>
                                ) : null}
                              </span>
                            </td>
                          </tr>
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer">
                              <PublicationsDrawer publications={applicantData?.publications || []} />
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer">
                              {formatPoints(
                                applicantData?.publicationPoints,
                                POINTS_MAX.publicationPoints
                              )}
                            </td>
                          </tr>
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer">
                              Μεταδιδακτορική εργασιακή εμπειρία
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer">
                              {formatPoints(
                                applicantData?.workExperiencePoints,
                                POINTS_MAX.workExperiencePoints
                              )}
                            </td>
                          </tr>
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer">
                              Προσαύξηση κατά 20% επί της συνολικής βαθμολογίας της
                              υποψηφιότητας, εφόσον ο υποψήφιος δεν έχει επιλεγεί σε άλλο
                              πρόγραμμα Απόκτησης Ακαδημαϊκής Διδακτικής Εμπειρίας, στο
                              πλαίσιο των προηγούμενων προσκλήσεων ΕΔΒΜ 20 (ακαδ. έτος
                              2016‐2017), ΕΔΒΜ 45 (ακαδ. έτος 2017‐2018), ΕΔΒΜ 82 (ακαδ.
                              έτος 2018‐2019), καθώς και της ΕΔΒΜ 96 (ακαδ. έτη 2019‐2020
                              και 2020‐2021) του ΕΠ ΑΝΑΔ ΕΔΒΜ 2014‐2020
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer">
                              {formatPoints(
                                applicantData?.notPastProgramPoints,
                                POINTS_MAX.notPastProgramPoints
                              )}
                            </td>
                          </tr>
                          <tr className="bg-patras-buccaneer font-semibold bg-wh">
                            <td className="px-6 py-4 text-white">Συνολικά μόρια</td>
                            <td className="px-6 py-4 text-center text-white">
                              {formatPoints(
                                applicantData?.totalPoints,
                                POINTS_MAX.totalPoints
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
      <PhdDetailsModal
        open={isPhdDetailsOpen}
        onClose={() => setIsPhdDetailsOpen(false)}
        title={phdTitle}
        abstract={phdAbstract}
        keywords={phdKeywords}
      />
      <CoursePlanDetailsModal
        open={isCoursePlanDetailsOpen}
        onClose={() => setIsCoursePlanDetailsOpen(false)}
        scientificField={applicantData?.scientificField || matchedPosition?.scientificField}
        courses={courses}
        coursePlans={applicantData?.coursePlans || {}}
      />
    </div>
  );
}
