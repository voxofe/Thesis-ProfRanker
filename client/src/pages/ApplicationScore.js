import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PublicationsDrawer from "../components/PublicationsDrawer";
import CoursesDrawer from "../components/CoursesDrawer";
import VaultFileActions from "../components/VaultFileActions";
import PhdDetailsModal from "../components/PhdDetailsModal";
import CoursePlanDetailsModal from "../components/CoursePlanDetailsModal";
import TooltipGray from "../components/TooltipGray";
import LoadingIndicator from "../components/LoadingIndicator";
import PageTitle from "../components/PageTitle";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePositions } from "../contexts/PositionsContext";
import { useLanguage } from "../contexts";

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

const thesisRelevanceLabel = (score, t) => {
  if (score === null || score === undefined) return "";
  if (score <= 4) return t("applicationScore.relevanceVeryLow");
  if (score <= 8) return t("applicationScore.relevanceLow");
  if (score <= 12) return t("applicationScore.relevanceMedium");
  if (score <= 16) return t("applicationScore.relevanceHigh");
  return t("applicationScore.relevanceVeryHigh");
};

const thesisRelevanceRanges = [
  { min: 0, max: 4, labelKey: "applicationScore.relevanceVeryLow" },
  { min: 5, max: 8, labelKey: "applicationScore.relevanceLow" },
  { min: 9, max: 12, labelKey: "applicationScore.relevanceMedium" },
  { min: 13, max: 16, labelKey: "applicationScore.relevanceHigh" },
  { min: 17, max: 20, labelKey: "applicationScore.relevanceVeryHigh" },
];

const coursePlanRelevanceRanges = [
  { min: 0, max: 5, labelKey: "applicationScore.relevanceVeryLow" },
  { min: 6, max: 10, labelKey: "applicationScore.relevanceLow" },
  { min: 11, max: 15, labelKey: "applicationScore.relevanceMedium" },
  { min: 16, max: 20, labelKey: "applicationScore.relevanceHigh" },
  { min: 21, max: 25, labelKey: "applicationScore.relevanceVeryHigh" },
];

const renderThesisRelevanceTooltip = (score, t) => {
  if (score === null || score === undefined) return null;
  return (
    <div className="text-xs text-gray-800 dark:text-[var(--color-text-primary)]">
      {thesisRelevanceRanges.map((range) => {
        const isActive = score >= range.min && score <= range.max;
        return (
          <div key={`${range.min}-${range.max}`} className={isActive ? "font-semibold" : ""}>
            {range.min}-{range.max}: {t(range.labelKey)}
          </div>
        );
      })}
    </div>
  );
};

const renderCoursePlanRelevanceTooltip = (score, t) => {
  if (score === null || score === undefined) return null;
  return (
    <div className="text-xs text-gray-800 dark:text-[var(--color-text-primary)]">
      {coursePlanRelevanceRanges.map((range) => {
        const isActive = score >= range.min && score <= range.max;
        return (
          <div key={`${range.min}-${range.max}`} className={isActive ? "font-semibold" : ""}>
            {range.min}-{range.max}: {t(range.labelKey)}
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
  const { t } = useLanguage();
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
    applicantData?.lastResubmissionDate ||
    applicantData?.resubmissionDate ||
    applicantData?.firstSubmissionDate ||
    applicantData?.submitDate ||
    applicantData?.submittedAt ||
    applicantData?.submissionDate ||
    "";
  const hasResubmissionDate = Boolean(
    applicantData?.lastResubmissionDate || applicantData?.resubmissionDate
  );

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
      label: t("applicationScore.docCv"),
      value: applicantData?.documents?.cv,
    },
    {
      key: "bioSupportingDocuments",
      label: t("applicationScore.docBioSupporting"),
      value: applicantData?.documents?.bioSupportingDocuments || [],
      isMulti: true,
    },
    {
      key: "coursePlan",
      label: t("applicationScore.docCoursePlan"),
      value: applicantData?.documents?.coursePlan,
    },
    {
      key: "phd",
      label: t("applicationScore.docPhd"),
      value: applicantData?.documents?.phd,
    },
    {
      key: "doatap",
      label: t("applicationScore.docDoatap"),
      value: applicantData?.documents?.doatap,
    },
    {
      key: "employmentCertificates",
      label: t("applicationScore.docEmploymentCertificates"),
      value: applicantData?.documents?.employmentCertificates || [],
      isMulti: true,
    },
    {
      key: "publicEmployeePermission",
      label: t("applicationScore.docPublicEmployeePermission"),
      value: applicantData?.documents?.publicEmployeePermission,
    },
    {
      key: "euCitizenGreekLanguageCertificate",
      label: t("applicationScore.docEuCitizenGreekLanguageCertificate"),
      value: applicantData?.documents?.euCitizenGreekLanguageCertificate,
    },
    {
      key: "notParticipatedDeclaration",
      label: t("applicationScore.docNotParticipatedDeclaration"),
      value: applicantData?.documents?.notParticipatedDeclaration,
    },
    ...(requiresMilitaryDoc
      ? [
          {
            key: "military",
            label: t("applicationScore.docMilitary", { year: academicYear }),
            value: applicantData?.documents?.military,
          },
        ]
      : []),
    {
      key: "responsibleDeclaration",
      label: t("applicationScore.docResponsibleDeclaration"),
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
      window.alert(t("applicationScore.periodEndedAlert"));
      window.location.reload();
      return;
    }
    navigate(`/form?mode=edit&applicationId=${editApplicationId}`);
  };

  const handleDeleteApplication = async () => {
    if (deleting) return;
    if (!isPositionCurrentlyActive()) {
      window.alert(t("applicationScore.periodEndedAlert"));
      window.location.reload();
      return;
    }
    const confirmed = window.confirm(t("applicationScore.confirmDelete"));
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
        <LoadingIndicator size="sm" textClassName="mt-2 text-gray-600 dark:text-[var(--color-text-secondary)]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-y-5 pt-0">
      <PageTitle className="mb-1">
        {isAdmin && applicantName ? (
          <>
            {t("applicationScore.pageTitlePrefix")}<span className="text-lg font-semibold">{applicantName}
            {applicantData?.scientificField ? ` - ${applicantData.scientificField}` : ""}
            </span>
          </>
        ) : (
          t("applicationScore.pageTitle")
        )}
      </PageTitle>
      {canEditApplication && (
        <div className="mb-6 mx-auto w-full max-w-2xl rounded-xl border border-gray-200 dark:border-[var(--color-border)] bg-gray-50 dark:bg-[var(--color-bg-muted)] px-4 py-3">
          <button
            type="button"
            onClick={() => setIsEditDrawerOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-3 text-patras-buccaneer dark:text-[var(--color-text-secondary)]"
          >
            <span className="text-sm text-center flex-1">
              {t("applicationScore.editHintPrefix")}{" "}
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
                {t("applicationScore.editApplication")}
              </Link>
              <button
                type="button"
                onClick={handleDeleteApplication}
                disabled={deleting}
                className="inline-flex shrink-0 items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("applicationScore.deleteApplication")}
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-full border border-patras-buccaneer/40 bg-white dark:bg-[var(--color-bg-card)]">
          <button
            type="button"
            onClick={() => setActiveTab("application")}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
              activeTab === "application"
                ? "bg-patras-buccaneer text-white"
                : "text-patras-buccaneer dark:text-[var(--color-text-secondary)] hover:bg-patras-albescentWhite dark:hover:bg-[var(--color-bg-muted)]"
            }`}
          >
            {t("applicationScore.tabApplication")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("score")}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
              activeTab === "score"
                ? "bg-patras-buccaneer text-white"
                : "text-patras-buccaneer dark:text-[var(--color-text-secondary)] hover:bg-patras-albescentWhite dark:hover:bg-[var(--color-bg-muted)]"
            }`}
          >
            {t("applicationScore.tabScore")}
          </button>
        </div>
      </div>
      
      {activeTab === "application" ? (
        
        <div>
           <h1 className="text-xl font-light mb-3 dark:text-[var(--color-text-primary)]">{t("applicationScore.positionDetailsHeading")}</h1>
            <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50 mb-5">
              <table className="min-w-full bg-white dark:bg-[var(--color-bg-card)]">
                <thead className="bg-patras-buccaneer">
                  <tr>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      {t("applicationScore.colSchool")}
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      {t("applicationScore.colDepartment")}
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      {t("applicationScore.colScientificField")}
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      {t("applicationScore.colStart")}
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      {t("applicationScore.colEnd")}
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      {t("applicationScore.colSubmit")}
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">
                      {t("applicationScore.colCourses")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-sm text-center align-middle border-r border-patras-albescentWhite">
                      {schoolName}
                    </td>
                    <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-sm text-center align-middle border-r border-patras-albescentWhite">
                      {departmentName}
                    </td>
                    <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-sm text-center align-middle border-r border-patras-albescentWhite font-semibold">
                      {applicantData?.scientificField || "—"}
                    </td>
                    <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-sm text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                      {toDDMMYYYYHHMM(startDate, startTime)}
                    </td>
                    <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-sm text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                      {toDDMMYYYYHHMM(endDate, endTime)}
                    </td>
                    <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-sm text-center align-middle border-r border-patras-albescentWhite">
                      <div className="inline-flex items-center gap-2 whitespace-nowrap">
                        <span>{toDDMMYYYYHHMM(submitDate)}</span>
                        <TooltipGray
                          content={
                            hasResubmissionDate
                              ? t("applicationScore.lastResubmission")
                              : t("applicationScore.initialSubmission")
                          }
                        >
                          <span
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-patras-buccaneer/50 text-[10px] font-semibold text-patras-buccaneer/80 dark:text-[var(--color-text-muted)]"
                            aria-label={t("applicationScore.submitDateInfoAria")}
                          >
                            i
                          </span>
                        </TooltipGray>
                      </div>
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
          <h1 className="text-xl font-light mb-3 dark:text-[var(--color-text-primary)]">{t("applicationScore.candidateDetailsHeading")}</h1>
          <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50 mb-5">
            <table className="min-w-full bg-white dark:bg-[var(--color-bg-card)]">
              <thead className="bg-patras-buccaneer">
                <tr>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    {t("applicationScore.colFirstName")}
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    {t("applicationScore.colLastName")}
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    {t("applicationScore.colPhdTitle")}
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    {t("applicationScore.colPhdDate")}
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">
                    {t("applicationScore.colWorkExperience")}
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-l border-patras-albescentWhite">
                    {t("applicationScore.colCoursePlan")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-center align-middle border-r border-patras-albescentWhite font-semibold">
                    {applicantData?.firstName}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-center align-middle border-r border-patras-albescentWhite font-semibold">
                    {applicantData?.lastName}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-center align-middle border-r border-patras-albescentWhite">
                    <button
                      type="button"
                      onClick={() => setIsPhdDetailsOpen(true)}
                      className="underline underline-offset-2 text-patras-buccaneer dark:text-[var(--color-text-secondary)] hover:text-patras-sanguineBrown dark:hover:text-[var(--color-text-primary)]"
                    >
                      {phdTitle}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                    {toDDMMYYYY(applicantData?.phdAcquisitionDate)}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-center align-middle">
                    {applicantData?.workExperience
                      ? `${applicantData?.workExperience} ${
                          applicantData?.workExperience === 1
                            ? t("applicationScore.yearSingular")
                            : t("applicationScore.yearPlural")
                        }`
                      : t("applicationScore.none")}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] text-center align-middle border-l border-patras-albescentWhite whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setIsCoursePlanDetailsOpen(true)}
                      className="bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors"
                    >
                      {t("applicationScore.view")}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

           

            <h1 className="text-xl font-light mb-3 dark:text-[var(--color-text-primary)]">{t("applicationScore.submittedDocsHeading")}</h1>
            <div className="relative overflow-visible shadow-md rounded-lg border border-patras-capePalliser/50 mb-5">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-[var(--color-bg-card)]">
                <thead className="bg-patras-buccaneer">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      {t("applicationScore.colDocument")}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      {t("applicationScore.colFile")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-patras-cameo">
                  {applicationDocuments.map((doc) => (
                    <tr key={doc.key}>
                      <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)] border-r border-patras-albescentWhite">
                        {doc.label}
                      </td>
                      <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                        <div className="flex flex-wrap gap-2">
                          {doc.docs.map((file, index) => {
                            const docKey = file?.id ? `id-${file.id}` : `name-${file?.name || index}`;
                            return (
                            <VaultFileActions
                              key={`${doc.key}-${file.id || index}`}
                              file={{ name: file?.name || t("applicationScore.fileFallback") }}
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
                      <h1 className="text-xl font-light dark:text-[var(--color-text-primary)]">{t("applicationScore.evaluationHeading")}</h1>
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-[var(--color-text-secondary)]">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-patras-albescentWhite text-patras-buccaneer">
                          <AiIndicatorIcon className="h-3.5 w-3.5" />
                        </span>
                        <span>{t("applicationScore.aiNote")}</span>
                      </span>
                    </div>
                    <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50">
                      
                      <table className="min-w-full bg-white dark:bg-[var(--color-bg-card)]">
                        <thead className="bg-patras-buccaneer">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                              {t("applicationScore.colCriterion")}
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                              {t("applicationScore.colScoring")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-patras-cameo">
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              {t("applicationScore.critCoursePlanRelevance")}
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              <span className="inline-flex items-center justify-center gap-2">
                                {formatPoints(
                                  applicantData?.coursePlanRelevancePoints,
                                  POINTS_MAX.coursePlanRelevancePoints
                                )}
                                {applicantData?.coursePlanRelevancePoints !== null &&
                                applicantData?.coursePlanRelevancePoints !== undefined ? (
                                  <TooltipGray
                                    content={renderCoursePlanRelevanceTooltip(applicantData?.coursePlanRelevancePoints, t)}
                                    className="w-auto max-w-xs whitespace-nowrap"
                                  >
                                    <span
                                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-patras-albescentWhite text-patras-buccaneer cursor-help"
                                      aria-label={t("applicationScore.coursePlanRelevanceAria")}
                                    >
                                      <AiIndicatorIcon className="h-3.5 w-3.5" />
                                    </span>
                                  </TooltipGray>
                                ) : null}
                              </span>
                            </td>
                          </tr>
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              {t("applicationScore.critStructure")}
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              {formatPoints(
                                applicantData?.courseMaterialStructurePoints,
                                POINTS_MAX.courseMaterialStructurePoints
                              )}
                            </td>
                          </tr>
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              {t("applicationScore.critThesisRelevance")}
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              <span className="inline-flex items-center justify-center gap-2">
                                {formatPoints(
                                  applicantData?.thesisRelevancePoints,
                                  POINTS_MAX.thesisRelevancePoints
                                )}
                                {applicantData?.thesisRelevancePoints !== null &&
                                applicantData?.thesisRelevancePoints !== undefined ? (
                                  <TooltipGray
                                    content={renderThesisRelevanceTooltip(applicantData?.thesisRelevancePoints, t)}
                                    className="w-auto max-w-xs whitespace-nowrap"
                                  >
                                    <span
                                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-patras-albescentWhite text-patras-buccaneer cursor-help"
                                      aria-label={t("applicationScore.thesisRelevanceAria")}
                                    >
                                      <AiIndicatorIcon className="h-3.5 w-3.5" />
                                    </span>
                                  </TooltipGray>
                                ) : null}
                              </span>
                            </td>
                          </tr>
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              <PublicationsDrawer publications={applicantData?.publications || []} />
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              {formatPoints(
                                applicantData?.publicationPoints,
                                POINTS_MAX.publicationPoints
                              )}
                            </td>
                          </tr>
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              {t("applicationScore.critWorkExperience")}
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              {formatPoints(
                                applicantData?.workExperiencePoints,
                                POINTS_MAX.workExperiencePoints
                              )}
                            </td>
                          </tr>
                          <tr className="">
                            <td className="px-6 py-4 text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              {t("applicationScore.critNotPastProgram")}
                            </td>
                            <td className="px-6 py-4 text-center text-patras-buccaneer dark:text-[var(--color-text-primary)]">
                              {formatPoints(
                                applicantData?.notPastProgramPoints,
                                POINTS_MAX.notPastProgramPoints
                              )}
                            </td>
                          </tr>
                          <tr className="bg-patras-buccaneer font-semibold bg-wh">
                            <td className="px-6 py-4 text-white">{t("applicationScore.totalPoints")}</td>
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
