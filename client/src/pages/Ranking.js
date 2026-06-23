import axios from "axios";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePositions } from "../contexts/PositionsContext";
import FilterModal from "../components/FilterModal";
import Checkbox from "../components/Checkbox";
import SortableTable, { formatDateTimeCell } from "../components/SortableTable";
import RefreshButton from "../components/RefreshButton";
import PageTitle from "../components/PageTitle";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

const columns = [
  { key: "applicationId", label: "Αριθμός Αίτησης" },
  { key: "firstName", label: "Όνομα" },
  { key: "lastName", label: "Επώνυμο" },
  { key: "school", label: "Σχολή" },
  { key: "department", label: "Τμήμα" },
  { key: "scientificField", label: "Επιστημονικό πεδίο" },
  { key: "submitDate", label: "Ημερομηνία Υποβολής" },
  { key: "status", label: "Κατάσταση αιτήσεων" },
  { key: "totalPoints", label: "Βαθμολόγηση (σε μόρια)" },
];

const statusLabels = ["Ενεργή", "Ολοκληρωμένη"];

function parseDDMMYYYY(dateStr, timeStr, fallbackTime = "00:00") {
  if (!dateStr) return null;
  const [datePart, timePart] = String(dateStr).split(" ");
  const parts = datePart.split("-").map((v) => parseInt(v, 10));
  let d;
  let m;
  let y;
  // Support both DD-MM-YYYY and ISO YYYY-MM-DD.
  if (parts.length === 3 && parts[0] > 999) {
    [y, m, d] = parts;
  } else {
    [d, m, y] = parts;
  }
  if (!d || !m || !y) return null;
  const rawTime = timeStr || timePart || fallbackTime;
  const [hh, mm] = String(rawTime).split(":").map((v) => parseInt(v, 10));
  const hours = Number.isFinite(hh) ? hh : 0;
  const minutes = Number.isFinite(mm) ? mm : 0;
  return new Date(y, m - 1, d, hours, minutes, 0, 0);
}

function parseDateOnly(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const isoMatch = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [_, y, m, d] = isoMatch;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const dmyMatch = raw.match(/(\d{2})[./-](\d{2})[./-](\d{4})/);
  if (dmyMatch) {
    const [_, d, m, y] = dmyMatch;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const fallback = new Date(raw);
  if (!Number.isNaN(fallback.getTime())) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
  }
  return null;
}

function formatIsoDateLabel(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return String(iso);
  return `${d}-${m}-${y}`;
}

function resolveApplicationId(applicant) {
  return applicant?.applicationId || applicant?.application_id || applicant?.id || "—";
}

function getApplicationScoreLink(applicant) {
  const appId = resolveApplicationId(applicant);
  if (!appId || appId === "—") return `/application-score/unknown`;
  return `/application-score/${appId}`;
}

function resolveSubmitDateRaw(applicant) {
  const firstSubmissionDate =
    applicant?.firstSubmissionDate ||
    applicant?.submitDate ||
    applicant?.submittedAt ||
    applicant?.submissionDate ||
    "";

  const latestResubmissionDate =
    applicant?.lastResubmissionDate ||
    applicant?.resubmissionDate ||
    applicant?.lastResubmittedAt ||
    "";

  const explicitResubmission = parseBooleanLike(
    applicant?.resubmission ?? applicant?.isResubmission ?? applicant?.hasResubmission
  );
  const hasResubmission =
    explicitResubmission === true ||
    (explicitResubmission === null && Boolean(latestResubmissionDate));

  if (hasResubmission && latestResubmissionDate) {
    return latestResubmissionDate;
  }
  return firstSubmissionDate;
}


function getApplicationStatus(endDateStr, endTimeStr) {
  const end = parseDDMMYYYY(endDateStr, endTimeStr, "23:59");
  if (!end) return "—";
  return end >= new Date() ? "Ενεργή" : "Ολοκληρωμένη";
}

function getStatusBadgeClasses(status) {
  const base =
    "inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold";
  if (status === "Ενεργή") return `${base} bg-yellow-100 text-yellow-800 border border-yellow-200`;
  if (status === "Ολοκληρωμένη") return `${base} bg-green-100 text-green-800 border border-green-200`;
  return `${base} bg-gray-100 dark:bg-[var(--color-bg-surface)] text-gray-700 dark:text-[var(--color-text-secondary)] border border-gray-200 dark:border-[var(--color-border)]`;
}

function parseBooleanLike(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "active", "ενεργή", "ενεργο"].includes(normalized)) return true;
    if (["false", "0", "no", "inactive", "completed", "ολοκληρωμένη"].includes(normalized)) return false;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return null;
}

function isCompletedForAppliedFilter(app) {
  const explicitActive = parseBooleanLike(app?.isActive ?? app?.active ?? app?.is_active);
  if (explicitActive !== null) return !explicitActive;

  const rawStatus = String(
    app?.status || app?.applicationStatus || app?.positionStatus || app?.state || ""
  )
    .trim()
    .toLowerCase();
  if (rawStatus) {
    if (rawStatus.includes("ολοκληρ") || rawStatus.includes("completed") || rawStatus.includes("inactive")) {
      return true;
    }
    if (rawStatus.includes("ενεργ") || rawStatus.includes("active")) {
      return false;
    }
  }

  const endDate =
    app?.positionEndDate || app?.endDate || app?.applicationEndDate || app?.position_end_date || "";
  const endTime = app?.positionEndTime || app?.endTime || app?.position_end_time || "";

  if (endDate) {
    const derivedStatus = getApplicationStatus(endDate, endTime);
    return derivedStatus === "Ολοκληρωμένη";
  }

  return false;
}

export default function Ranking() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    schools: [],
    departments: [],
    scientificFields: [],
    status: [],
    pointsMin: "",
    pointsMax: "",
    dateRanges: {
      submitDate: { from: "", to: "" },
    },
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { refreshPositions } = usePositions();
  const [refreshing, setRefreshing] = useState(false);

  // Roles
  const isAdmin = !!(
    currentUser?.isAdmin ||
    currentUser?.role === "admin" ||
    currentUser?.is_staff ||
    currentUser?.is_superuser
  );
  const isApplicant = !!currentUser && !isAdmin && currentUser?.role !== "guest";
  const isGuest = currentUser?.role === "guest";
  const viewerId = currentUser?.id;

  const appliedScientificFields = useMemo(() => {
    const apps = Array.isArray(currentUser?.applications)
      ? currentUser.applications
      : [];
    const completedApps = apps.filter(isCompletedForAppliedFilter);

    const fields = completedApps
      .map((app) => (app?.scientificField || "").trim())
      .filter(Boolean);
    return Array.from(new Set(fields));
  }, [currentUser]);

  const appliedScientificFieldSet = useMemo(
    () => new Set(appliedScientificFields),
    [appliedScientificFields]
  );

  const guestVisitRecordedRef = useRef(false);

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await axios({
        method: "GET",
        url: `${API_BASE_URL}/api/applicant/all`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching ranking data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const recordGuestRankingVisit = useCallback(async () => {
    if (!isGuest) return;
    if (guestVisitRecordedRef.current) return;
    guestVisitRecordedRef.current = true;
    const token = localStorage.getItem("token");
    try {
      await axios({
        method: "POST",
        url: `${API_BASE_URL}/api/guests/ranking-visit`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error("Error recording guest ranking visit:", error);
    }
  }, [isGuest]);

  useEffect(() => {
    guestVisitRecordedRef.current = false;
  }, [currentUser?.id]);

  useEffect(() => {
    recordGuestRankingVisit();
  }, [recordGuestRankingVisit]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await recordGuestRankingVisit();
      await Promise.all([
        fetchUsers(),
        refreshPositions ? refreshPositions() : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUsers, refreshPositions]);

  // Build filter options from loaded users
  const filterOptions = useMemo(() => {
    const schools = [...new Set(users.map(u => u.school).filter(Boolean))];
    const departments = [...new Set(users.map(u => u.department).filter(Boolean))];
    const scientificFields = [...new Set(users.map(u => u.scientificField).filter(Boolean))];
    return {
      schools,
      departments,
      scientificFields,
      statuses: statusLabels,
    };
  }, [users]);

  // Sync filters to URL
  useEffect(() => {
    const params = {};
    if (filters.schools.length) params.school = filters.schools.join(",");
    if (filters.departments.length) params.department = filters.departments.join(",");
    if (filters.scientificFields.length) params.scientificField = filters.scientificFields.join(",");
    if (filters.status.length) params.status = filters.status.join(",");
    if (filters.pointsMin) params.pointsMin = filters.pointsMin;
    if (filters.pointsMax) params.pointsMax = filters.pointsMax;
    if (filters.dateRanges?.submitDate?.from) params.submitDateFrom = filters.dateRanges.submitDate.from;
    if (filters.dateRanges?.submitDate?.to) params.submitDateTo = filters.dateRanges.submitDate.to;
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Load filters from URL on mount
  useEffect(() => {
    const params = Object.fromEntries([...searchParams.entries()]);
    setFilters(f => ({
      schools: params.school ? params.school.split(",") : [],
      departments: params.department ? params.department.split(",") : [],
      scientificFields: params.scientificField ? params.scientificField.split(",") : [],
      status: params.status ? params.status.split(",") : [],
      pointsMin: params.pointsMin || "",
      pointsMax: params.pointsMax || "",
      dateRanges: {
        submitDate: {
          from: params.submitDateFrom || "",
          to: params.submitDateTo || "",
        },
      },
    }));
    // eslint-disable-next-line
  }, []);

  // Filter users client-side
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Role-based filter: only Ολοκληρωμένη for non-admins
      if (!isAdmin && getApplicationStatus(u.positionEndDate, u.positionEndTime) !== "Ολοκληρωμένη") return false;
      // School/Department/Scientific Field (OR across categories)
      const hasOrFilters =
        filters.schools.length ||
        filters.departments.length ||
        filters.scientificFields.length;
      if (hasOrFilters) {
        const schoolMatch = filters.schools.includes(u.school);
        const departmentMatch = filters.departments.includes(u.department);
        const scientificFieldMatch = filters.scientificFields.includes(u.scientificField);
        if (!(schoolMatch || departmentMatch || scientificFieldMatch)) return false;
      }
      // Status (admin only)
      if (isAdmin && filters.status.length && !filters.status.includes(getApplicationStatus(u.positionEndDate, u.positionEndTime))) return false;
      // Points range
      if (filters.pointsMin && Number(u.totalPoints) < Number(filters.pointsMin)) return false;
      if (filters.pointsMax && Number(u.totalPoints) > Number(filters.pointsMax)) return false;
      const submitRange = filters.dateRanges?.submitDate;
      if (submitRange?.from || submitRange?.to) {
        const submitRaw = resolveSubmitDateRaw(u);
        const submitDate = parseDateOnly(submitRaw);
        if (!submitDate) return false;
        if (submitRange.from) {
          const fromDate = parseDateOnly(submitRange.from);
          if (fromDate && submitDate < fromDate) return false;
        }
        if (submitRange.to) {
          const toDate = parseDateOnly(submitRange.to);
          if (toDate && submitDate > toDate) return false;
        }
      }
      return true;
    });
  }, [users, filters, isAdmin]);

  const searchableUsers = useMemo(
    () => filteredUsers.map((user) => ({
      ...user,
      status: getApplicationStatus(user.positionEndDate, user.positionEndTime),
    })),
    [filteredUsers]
  );

  const getSortedUsers = (rows, sortBy, sortDirection) => {
    const byDate = (a, b, key) => {
      const isStart = key === "positionStartDate";
      const fallbackTime = isStart ? "00:00" : "23:59";
      const da = parseDDMMYYYY(a[key], isStart ? a.positionStartTime : a.positionEndTime, fallbackTime);
      const db = parseDDMMYYYY(b[key], isStart ? b.positionStartTime : b.positionEndTime, fallbackTime);
      if (!da && !db) return 0;
      if (!da) return sortDirection === "asc" ? -1 : 1;
      if (!db) return sortDirection === "asc" ? 1 : -1;
      return sortDirection === "asc" ? da - db : db - da;
    };

    if (sortBy === "totalPoints") {
      return [...rows].sort((a, b) =>
        sortDirection === "asc" ? a.totalPoints - b.totalPoints : b.totalPoints - a.totalPoints
      );
    }

    if (sortBy === "applicationId") {
      return [...rows].sort((a, b) => {
        const aId = resolveApplicationId(a);
        const bId = resolveApplicationId(b);
        const aNum = Number(aId);
        const bNum = Number(bId);
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
          return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
        }
        const valA = String(aId).toLowerCase();
        const valB = String(bId).toLowerCase();
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    if (sortBy === "submitDate") {
      return [...rows].sort((a, b) => {
        const aRaw = resolveSubmitDateRaw(a);
        const bRaw = resolveSubmitDateRaw(b);
        const da = parseDDMMYYYY(aRaw, null, "00:00");
        const db = parseDDMMYYYY(bRaw, null, "00:00");
        if (!da && !db) return 0;
        if (!da) return sortDirection === "asc" ? -1 : 1;
        if (!db) return sortDirection === "asc" ? 1 : -1;
        return sortDirection === "asc" ? da - db : db - da;
      });
    }

    if (sortBy === "positionStartDate" || sortBy === "positionEndDate") {
      return [...rows].sort((a, b) => byDate(a, b, sortBy));
    }

    if (sortBy === "status") {
      const rank = (u) => {
        const s = getApplicationStatus(u.positionEndDate, u.positionEndTime);
        if (s === "Ενεργή") return 2;
        if (s === "Ολοκληρωμένη") return 1;
        return 0;
      };
      return [...rows].sort((a, b) => {
        const ra = rank(a);
        const rb = rank(b);
        if (ra === rb) {
          const da = parseDDMMYYYY(a.positionEndDate, a.positionEndTime, "23:59");
          const db = parseDDMMYYYY(b.positionEndDate, b.positionEndTime, "23:59");
          if (!da && !db) return 0;
          if (!da) return sortDirection === "asc" ? -1 : 1;
          if (!db) return sortDirection === "asc" ? 1 : -1;
          return sortDirection === "asc" ? da - db : db - da;
        }
        return sortDirection === "asc" ? ra - rb : rb - ra;
      });
    }

    // String fields
    return [...rows].sort((a, b) => {
      const valA = a[sortBy]?.toString().toLowerCase() || "";
      const valB = b[sortBy]?.toString().toLowerCase() || "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Applicant: checkbox to show only applications for positions they've applied to
  const [showMyPosition, setShowMyPosition] = useState(false);

  const isMyPositionFilterActive = useMemo(() => {
    const submitFrom = filters.dateRanges?.submitDate?.from || "";
    const submitTo = filters.dateRanges?.submitDate?.to || "";
    const onlyScientificFields =
      !filters.schools.length &&
      !filters.departments.length &&
      !filters.status.length &&
      !filters.pointsMin &&
      !filters.pointsMax &&
      !submitFrom &&
      !submitTo;

    const sameFields =
      filters.scientificFields.length === appliedScientificFields.length &&
      filters.scientificFields.every((sf) => appliedScientificFieldSet.has(sf));

    return onlyScientificFields && sameFields;
  }, [filters, appliedScientificFields, appliedScientificFieldSet]);

  useEffect(() => {
    setShowMyPosition((prev) =>
      prev === isMyPositionFilterActive ? prev : isMyPositionFilterActive
    );
  }, [isMyPositionFilterActive]);

  // Filter tags
  const filterTags = useMemo(() => {
    const tags = [];
    filters.schools.forEach(s => tags.push({ key: "schools", value: s, label: `Σχολή: ${s}` }));
    filters.departments.forEach(d => tags.push({ key: "departments", value: d, label: `Τμήμα: ${d}` }));
    filters.scientificFields.forEach(sf => tags.push({ key: "scientificFields", value: sf, label: `Επιστημονικό πεδίο: ${sf}` }));
    if (isAdmin) filters.status.forEach(st => tags.push({ key: "status", value: st, label: `Κατάσταση: ${st}` }));
    if (filters.pointsMin) tags.push({ key: "pointsMin", value: filters.pointsMin, label: `Μόρια ≥ ${filters.pointsMin}` });
    if (filters.pointsMax) tags.push({ key: "pointsMax", value: filters.pointsMax, label: `Μόρια ≤ ${filters.pointsMax}` });
    const submitRange = filters.dateRanges?.submitDate;
    if (submitRange?.from) {
      tags.push({
        key: "dateRange",
        rangeKey: "submitDate",
        bound: "from",
        label: `Ημερομηνία υποβολής από ${formatIsoDateLabel(submitRange.from)}`,
      });
    }
    if (submitRange?.to) {
      tags.push({
        key: "dateRange",
        rangeKey: "submitDate",
        bound: "to",
        label: `Ημερομηνία υποβολής έως ${formatIsoDateLabel(submitRange.to)}`,
      });
    }
    return tags;
  }, [filters, isAdmin]);

  const [searchText, setSearchText] = useState("");
  const removeTag = (tag) => {
    if (isMyPositionFilterActive) {
      setShowMyPosition(false);
    }
    setFilters((prev) => {
      if (["schools", "departments", "scientificFields", "status"].includes(tag.key)) {
        return { ...prev, [tag.key]: prev[tag.key].filter((v) => v !== tag.value) };
      }
      if (tag.key === "pointsMin") return { ...prev, pointsMin: "" };
      if (tag.key === "pointsMax") return { ...prev, pointsMax: "" };
      if (tag.key === "dateRange") {
        return {
          ...prev,
          dateRanges: {
            ...prev.dateRanges,
            [tag.rangeKey]: {
              ...prev.dateRanges?.[tag.rangeKey],
              [tag.bound]: "",
            },
          },
        };
      }
      return prev;
    });
  };

  const clearAllFilters = () => {
    if (isMyPositionFilterActive) {
      setShowMyPosition(false);
    }
    setFilters({
      schools: [],
      departments: [],
      scientificFields: [],
      status: [],
      pointsMin: "",
      pointsMax: "",
      dateRanges: {
        submitDate: { from: "", to: "" },
      },
    });
  };

  const headerCellClassName = (col) => [
    "px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider cursor-pointer select-none",
    col.key === "applicationId" ? "w-20" : "",
    col.key === "firstName" || col.key === "lastName" ? "w-24" : "",
    col.key === "status" ? "w-28" : "",
  ].join(" ").trim();

  const renderRow = (applicant, key) => {
    const isSelf = isApplicant && applicant.id === viewerId;
    const clickable = isAdmin || isSelf;
    return (
      <tr
        // navigation is handled by per-cell <Link> so middle-click/ctrl+click open in new tab
        onClick={undefined}
        key={key}
        className={[
          clickable ? "cursor-pointer hover:bg-patras-albescentWhite/50" : "cursor-default",
          isSelf ? "bg-patras-sanguineBrown/10 relative" : ""
        ].join(" ")}
      >
        <td
          className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap truncate w-20"
          title={String(resolveApplicationId(applicant))}
        >
          {clickable ? (
            <Link to={getApplicationScoreLink(applicant)} className="block w-full h-full px-6 py-4">
              {resolveApplicationId(applicant)}
            </Link>
          ) : (
            <div className="px-6 py-4">{resolveApplicationId(applicant)}</div>
          )}
        </td>
        <td
          className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap truncate w-24"
          title={applicant.firstName}
        >
          {clickable ? (
            <Link to={getApplicationScoreLink(applicant)} className="block w-full h-full px-6 py-4">
              {applicant.firstName}
            </Link>
          ) : (
            <div className="px-6 py-4">{applicant.firstName}</div>
          )}
        </td>
        <td
          className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap truncate w-24"
          title={applicant.lastName}
        >
          {clickable ? (
            <Link to={getApplicationScoreLink(applicant)} className="block w-full h-full px-6 py-4">
              {applicant.lastName}
            </Link>
          ) : (
            <div className="px-6 py-4">{applicant.lastName}</div>
          )}
        </td>
        <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
          {clickable ? (
            <Link to={getApplicationScoreLink(applicant)} className="block w-full h-full px-6 py-4">
              {applicant.school}
            </Link>
          ) : (
            <div className="px-6 py-4">{applicant.school}</div>
          )}
        </td>
        <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
          {clickable ? (
            <Link to={getApplicationScoreLink(applicant)} className="block w-full h-full px-6 py-4">
              {applicant.department}</Link>
          ) : (
            <div className="px-6 py-4">{applicant.department}</div>
          )}
        </td>
        <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
          {clickable ? (
            <Link to={getApplicationScoreLink(applicant)} className="block w-full h-full px-6 py-4">
              {applicant.scientificField}
            </Link>
          ) : (
            <div className="px-6 py-4">{applicant.scientificField}</div>
          )}
        </td>
        <td className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap">
          {clickable ? (
            <Link to={getApplicationScoreLink(applicant)} className="block w-full h-full px-6 py-4">
              {formatDateTimeCell(resolveSubmitDateRaw(applicant), null, "00:00")}
            </Link>
          ) : (
            <div className="px-6 py-4">{formatDateTimeCell(resolveSubmitDateRaw(applicant), null, "00:00")}</div>
          )}
        </td>
        <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words w-28">
          {(() => {
            const status = getApplicationStatus(applicant.positionEndDate, applicant.positionEndTime);
            const content = <span className={getStatusBadgeClasses(status)}>{status}</span>;
            return clickable ? (
              <Link to={getApplicationScoreLink(applicant)} className="block w-full h-full px-6 py-4">
                {content}
              </Link>
            ) : (
              <div className="px-6 py-4">{content}</div>
            );
          })()}
        </td>
        <td className="text-center">
          {clickable ? (
            <Link to={getApplicationScoreLink(applicant)} className="block w-full h-full px-6 py-4">
              <div className="flex justify-center">
                <span className="inline-block min-w-[30px] px-3 py-1 rounded-md text-black dark:text-white font-semibold text-sm shadow-md ">
                  {applicant.totalPoints}
                </span>
              </div>
            </Link>
          ) : (
            <div className="px-6 py-4">
              <span className="inline-block min-w-[30px] px-3 py-1 rounded-md text-black dark:text-white font-semibold text-sm shadow-md">
                {applicant.totalPoints}
              </span>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="pt-0">
      <PageTitle className="mb-6">Λίστα κατάταξης αιτήσεων</PageTitle>

      {/* Filter Modal */}
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        isAdmin={isAdmin}
        title="Φίλτρα αιτήσεων"
        titleClassName="text-gray-900 dark:text-[var(--color-text-primary)]"
        showDateRanges
        dateRangeFields={[{ key: "submitDate", label: "Ημερομηνία υποβολής" }]}
        onReset={() => setFilters({
          schools: [],
          departments: [],
          scientificFields: [],
          status: [],
          pointsMin: "",
          pointsMax: "",
          dateRanges: {
            submitDate: { from: "", to: "" },
          },
        })}
      />

      <div className="mb-2 grid grid-cols-[1fr_auto] items-end gap-3 min-h-[36px]">
        <div className="flex flex-wrap items-center gap-2 min-h-[28px] min-w-[12rem] self-end">
          {isApplicant && appliedScientificFields.length > 0 && (
            <div className="w-full basis-full">
              <Checkbox
                id="show-my-field"
                name="show-my-field"
                checked={isMyPositionFilterActive}
                onChange={(checked) => {
                  setShowMyPosition(checked);
                  if (checked) {
                    setFilters({
                      schools: [],
                      departments: [],
                      scientificFields: appliedScientificFields,
                      status: [],
                      pointsMin: "",
                      pointsMax: "",
                      dateRanges: {
                        submitDate: { from: "", to: "" },
                      },
                    });
                  } else {
                    setFilters({
                      schools: [],
                      departments: [],
                      scientificFields: [],
                      status: [],
                      pointsMin: "",
                      pointsMax: "",
                      dateRanges: {
                        submitDate: { from: "", to: "" },
                      },
                    });
                  }
                }}
                label="Εμφάνιση αιτήσεων για τις θέσεις που έχω επιλέξει (μόνο ολοκληρωμένες)"
              />
            </div>
          )}
          {filterTags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center bg-patras-buccaneer/10 text-patras-buccaneer px-3 py-1 rounded-full text-xs font-medium border border-patras-buccaneer"
            >
              {tag.label}
              <button
                className="ml-2 text-patras-sanguineBrown hover:text-red-700 text-xs font-bold"
                onClick={() => removeTag(tag)}
                title="Αφαίρεση φίλτρου"
              >
                &times;
              </button>
            </span>
          ))}
          {filterTags.length > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-patras-buccaneer text-patras-buccaneer hover:bg-patras-buccaneer hover:text-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
              Καθαρισμός όλων
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            className="shrink-0"
          />
          <div className="relative w-64">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[var(--color-text-muted)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
              </svg>
            </span>
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Αναζήτηση αιτήσεων..."
              className="w-full rounded-md border border-patras-capePalliser/50 bg-white dark:bg-[var(--color-bg-card)] py-1.5 pl-9 pr-3 text-sm text-gray-800 dark:text-[var(--color-text-primary)] shadow-sm focus:border-patras-buccaneer focus:outline-none"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/5 text-red-700 hover:bg-red-500/10 hover:text-red-800"
                aria-label="Καθαρισμός αναζήτησης"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <button
            aria-label="Άνοιγμα φίλτρων"
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-patras-buccaneer text-white font-medium text-sm shadow-sm hover:bg-patras-sanguineBrown transition border border-patras-buccaneer"
            onClick={() => setFilterOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A2 2 0 0013 14.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-2.586a2 2 0 00-.586-1.414L3 6.707A1 1 0 013 6V4z"/>
            </svg>
            Φίλτρα
          </button>
        </div>
      </div>

      <div className="relative overflow-visible mt-3">
        <SortableTable
          columns={columns}
          rows={searchableUsers}
          searchableColumns={["applicationId", "firstName", "lastName", "school", "department", "scientificField", "status"]}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          showSearchBar={false}
          loading={loading}
          getSortedRows={getSortedUsers}
          getRowKey={(row) => row?.applicationId ?? row?.id}
          initialSortBy="totalPoints"
          initialSortDirection="desc"
          headerCellClassName={headerCellClassName}
          emptyMessage="Δεν βρέθηκαν αποτελέσματα με βάση τα φίλτρα σας."
          renderRow={renderRow}
        />
    </div>
    </div>
  );
}
