import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts";
import FilterModal from "../components/FilterModal";
import SortableTable, { formatDateTimeCell } from "../components/SortableTable";
import PageTitle from "../components/PageTitle";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

const columnKeys = [
  { key: "scientificField", labelKey: "scientificFieldsView.colScientificField" },
  { key: "school", labelKey: "scientificFieldsView.colSchool" },
  { key: "department", labelKey: "scientificFieldsView.colDepartment" },
  { key: "state", labelKey: "scientificFieldsView.colState" },
  { key: "applicants", labelKey: "scientificFieldsView.colApplicants" },
  { key: "startDate", labelKey: "scientificFieldsView.colStartDate" },
  { key: "endDate", labelKey: "scientificFieldsView.colEndDate" },
];

function getStateBadgeClasses(stateCode) {
  const base =
    "inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold";
  if (stateCode === "active") return `${base} bg-yellow-100 text-yellow-800 border border-yellow-200`;
  if (stateCode === "completed") return `${base} bg-green-100 text-green-800 border border-green-200`;
  if (stateCode === "pending") return `${base} bg-blue-100 text-blue-800 border border-blue-200`;
  if (stateCode === "unpublished") return `${base} bg-gray-100 dark:bg-[var(--color-bg-surface)] text-gray-700 dark:text-[var(--color-text-secondary)] border border-gray-200 dark:border-[var(--color-border)]`;
  return `${base} bg-gray-100 dark:bg-[var(--color-bg-surface)] text-gray-700 dark:text-[var(--color-text-secondary)] border border-gray-200 dark:border-[var(--color-border)]`;
}

function parseIsoDateTime(dateValue, timeValue) {
  if (!dateValue) return null;
  const [y, m, d] = String(dateValue).split("-").map((part) => Number(part));
  if (!y || !m || !d) return null;
  const [hh, mm] = String(timeValue || "00:00").split(":").map((part) => Number(part));
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

function parseTimestamp(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function ScientificFieldsView() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [scientificFields, setScientificFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    schools: [],
    departments: [],
    status: [],
    pointsMin: "",
    pointsMax: "",
    dateRanges: {
      startDate: { from: "", to: "" },
      endDate: { from: "", to: "" },
    },
  });
  const [searchText, setSearchText] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = !!(
    currentUser?.isAdmin ||
    currentUser?.role === "admin" ||
    currentUser?.is_staff ||
    currentUser?.is_superuser
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return;
    setLoading(true);
    axios({
      method: "GET",
      url: `${API_BASE_URL}/api/scientific-fields`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => setScientificFields(response.data || []))
      .catch((error) => {
        console.error("Error fetching scientific fields:", error);
        setScientificFields([]);
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const rows = useMemo(() => {
    return (scientificFields || []).map((sf) => {
      const startDate = parseIsoDateTime(sf.positionStartDate, sf.positionStartTime);
      const endDate = parseIsoDateTime(sf.positionEndDate, sf.positionEndTime);
      return {
        id: sf.id,
        scientificField: sf.name,
        school: sf.school,
        department: sf.department,
        createdAt: sf.createdAt || null,
        stateKey: sf.state,
        state: sf.state ? t(`positionState.${sf.state}`) : "—",
        applicants: sf.applications || 0,
        startDate: sf.positionStartDate || "",
        endDate: sf.positionEndDate || "",
        startTime: sf.positionStartTime || "",
        endTime: sf.positionEndTime || "",
        _createdAt: parseTimestamp(sf.createdAt),
        _startDate: startDate,
        _endDate: endDate,
      };
    });
  }, [scientificFields, t]);

  const columns = useMemo(
    () => columnKeys.map((c) => ({ key: c.key, label: t(c.labelKey) })),
    [t]
  );

  const filterOptions = useMemo(() => {
    const schools = [...new Set(rows.map((r) => r.school).filter(Boolean))];
    const departments = [...new Set(rows.map((r) => r.department).filter(Boolean))];
    const statuses = [...new Set(rows.map((r) => r.state).filter(Boolean))];
    return {
      schools,
      departments,
      statuses,
    };
  }, [rows]);

  useEffect(() => {
    const params = {};
    if (filters.schools.length) params.school = filters.schools.join(",");
    if (filters.departments.length) params.department = filters.departments.join(",");
    if (filters.status.length) params.status = filters.status.join(",");
    if (filters.pointsMin) params.pointsMin = filters.pointsMin;
    if (filters.pointsMax) params.pointsMax = filters.pointsMax;
    if (filters.dateRanges?.startDate?.from) params.startDateFrom = filters.dateRanges.startDate.from;
    if (filters.dateRanges?.startDate?.to) params.startDateTo = filters.dateRanges.startDate.to;
    if (filters.dateRanges?.endDate?.from) params.endDateFrom = filters.dateRanges.endDate.from;
    if (filters.dateRanges?.endDate?.to) params.endDateTo = filters.dateRanges.endDate.to;
    setSearchParams(params);
  }, [filters, setSearchParams]);

  useEffect(() => {
    const params = Object.fromEntries([...searchParams.entries()]);
    setFilters((prev) => ({
      ...prev,
      schools: params.school ? params.school.split(",") : [],
      departments: params.department ? params.department.split(",") : [],
      status: params.status ? params.status.split(",") : [],
      pointsMin: params.pointsMin || "",
      pointsMax: params.pointsMax || "",
      dateRanges: {
        startDate: {
          from: params.startDateFrom || "",
          to: params.startDateTo || "",
        },
        endDate: {
          from: params.endDateFrom || "",
          to: params.endDateTo || "",
        },
      },
    }));
    // eslint-disable-next-line
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filters.schools.length && !filters.schools.includes(r.school)) return false;
      if (filters.departments.length && !filters.departments.includes(r.department)) return false;
      if (filters.status.length && !filters.status.includes(r.state)) return false;
      if (filters.pointsMin && Number(r.applicants) < Number(filters.pointsMin)) return false;
      if (filters.pointsMax && Number(r.applicants) > Number(filters.pointsMax)) return false;
      const startRange = filters.dateRanges?.startDate;
      if (startRange?.from || startRange?.to) {
        const startDate = parseDateOnly(r.startDate);
        if (!startDate) return false;
        if (startRange.from) {
          const fromDate = parseDateOnly(startRange.from);
          if (fromDate && startDate < fromDate) return false;
        }
        if (startRange.to) {
          const toDate = parseDateOnly(startRange.to);
          if (toDate && startDate > toDate) return false;
        }
      }
      const endRange = filters.dateRanges?.endDate;
      if (endRange?.from || endRange?.to) {
        const endDate = parseDateOnly(r.endDate);
        if (!endDate) return false;
        if (endRange.from) {
          const fromDate = parseDateOnly(endRange.from);
          if (fromDate && endDate < fromDate) return false;
        }
        if (endRange.to) {
          const toDate = parseDateOnly(endRange.to);
          if (toDate && endDate > toDate) return false;
        }
      }
      return true;
    });
  }, [rows, filters]);

  const getSortedRows = useMemo(() => (rows, sortBy, sortDirection) => {
    const byCreationDate = (a, b) => {
      const aCreated = a._createdAt;
      const bCreated = b._createdAt;
      if (aCreated && bCreated) {
        const diff = bCreated - aCreated;
        if (diff !== 0) return diff;
      } else if (aCreated || bCreated) {
        return aCreated ? -1 : 1;
      }

      const aId = Number(a.id);
      const bId = Number(b.id);
      if (Number.isFinite(aId) && Number.isFinite(bId) && aId !== bId) {
        return bId - aId;
      }
      return 0;
    };

    const withTieBreaker = (compare) => (a, b) => {
      const result = compare(a, b);
      if (result !== 0) return result;
      return byCreationDate(a, b);
    };

    const byDate = (a, b, key) => {
      const da = a[key];
      const db = b[key];
      if (!da && !db) return 0;
      if (!da) return sortDirection === "asc" ? -1 : 1;
      if (!db) return sortDirection === "asc" ? 1 : -1;
      return sortDirection === "asc" ? da - db : db - da;
    };

    if (sortBy === "startDate") {
      return [...rows].sort(withTieBreaker((a, b) => byDate(a, b, "_startDate")));
    }

    if (sortBy === "endDate") {
      return [...rows].sort(withTieBreaker((a, b) => byDate(a, b, "_endDate")));
    }

    if (sortBy === "applicants") {
      return [...rows].sort(withTieBreaker((a, b) =>
        sortDirection === "asc" ? a.applicants - b.applicants : b.applicants - a.applicants
      ));
    }

    if (sortBy === "state") {
      const rank = (value) => {
        if (value === "active") return 2;
        if (value === "completed") return 1;
        if (value === "pending") return 0;
        return -1;
      };
      return [...rows].sort(withTieBreaker((a, b) => {
        const ra = rank(a.stateKey);
        const rb = rank(b.stateKey);
        if (ra === rb) return 0;
        return sortDirection === "asc" ? ra - rb : rb - ra;
      }));
    }

    return [...rows].sort(withTieBreaker((a, b) => {
      const valA = a[sortBy]?.toString().toLowerCase() || "";
      const valB = b[sortBy]?.toString().toLowerCase() || "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }));
  }, []);

  const filterTags = useMemo(() => {
    const tags = [];
    filters.schools.forEach((s) => tags.push({ key: "schools", value: s, label: t("scientificFieldsView.tagSchool", { value: s }) }));
    filters.departments.forEach((d) => tags.push({ key: "departments", value: d, label: t("scientificFieldsView.tagDepartment", { value: d }) }));
    filters.status.forEach((st) => tags.push({ key: "status", value: st, label: t("scientificFieldsView.tagStatus", { value: st }) }));
    if (filters.pointsMin) tags.push({ key: "pointsMin", value: filters.pointsMin, label: t("scientificFieldsView.tagApplicantsMin", { value: filters.pointsMin }) });
    if (filters.pointsMax) tags.push({ key: "pointsMax", value: filters.pointsMax, label: t("scientificFieldsView.tagApplicantsMax", { value: filters.pointsMax }) });
    const startRange = filters.dateRanges?.startDate;
    if (startRange?.from) {
      tags.push({
        key: "dateRange",
        rangeKey: "startDate",
        bound: "from",
        label: t("scientificFieldsView.tagStartFrom", { date: formatIsoDateLabel(startRange.from) }),
      });
    }
    if (startRange?.to) {
      tags.push({
        key: "dateRange",
        rangeKey: "startDate",
        bound: "to",
        label: t("scientificFieldsView.tagStartTo", { date: formatIsoDateLabel(startRange.to) }),
      });
    }
    const endRange = filters.dateRanges?.endDate;
    if (endRange?.from) {
      tags.push({
        key: "dateRange",
        rangeKey: "endDate",
        bound: "from",
        label: t("scientificFieldsView.tagEndFrom", { date: formatIsoDateLabel(endRange.from) }),
      });
    }
    if (endRange?.to) {
      tags.push({
        key: "dateRange",
        rangeKey: "endDate",
        bound: "to",
        label: t("scientificFieldsView.tagEndTo", { date: formatIsoDateLabel(endRange.to) }),
      });
    }
    return tags;
  }, [filters, t]);

  const removeTag = (tag) => {
    setFilters((prev) => {
      if (["schools", "departments", "status"].includes(tag.key)) {
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
    setFilters({
      schools: [],
      departments: [],
      status: [],
      pointsMin: "",
      pointsMax: "",
      dateRanges: {
        startDate: { from: "", to: "" },
        endDate: { from: "", to: "" },
      },
    });
  };

  const buildFieldLink = (row) => `/scientific-fields/view/${row.id}`;

  return (
    <div className="pt-0">
      <PageTitle className="mb-6">{t("scientificFieldsView.pageTitle")}</PageTitle>
      <div className="mb-2 grid grid-cols-[1fr_auto] items-end gap-3 min-h-[36px]">
        <div className="flex flex-wrap items-center gap-2 min-h-[28px] min-w-[12rem] self-end">
          {filterTags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center bg-patras-buccaneer/10 text-patras-buccaneer dark:bg-[var(--color-bg-surface)] dark:text-[var(--color-text-secondary)] px-3 py-1 rounded-full text-xs font-medium border border-patras-buccaneer dark:border-[var(--color-border-accent)]"
            >
              {tag.label}
              <button
                className="ml-2 text-patras-sanguineBrown hover:text-red-700 dark:text-[var(--color-text-muted)] dark:hover:text-[var(--color-danger)] text-xs font-bold"
                onClick={() => removeTag(tag)}
                title={t("scientificFieldsView.removeFilter")}
              >
                &times;
              </button>
            </span>
          ))}
          {filterTags.length > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-patras-buccaneer text-patras-buccaneer hover:bg-patras-buccaneer hover:text-white dark:border-[var(--color-border-accent)] dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-primary)] dark:hover:text-[var(--color-text-inverse)] transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
              {t("scientificFieldsView.clearAll")}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
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
              placeholder={t("scientificFieldsView.searchPlaceholder")}
              className="w-full rounded-md border border-patras-capePalliser/50 bg-white dark:bg-[var(--color-bg-card)] py-1.5 pl-9 pr-3 text-sm text-gray-800 dark:text-[var(--color-text-primary)] shadow-sm focus:border-patras-buccaneer focus:outline-none"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/5 text-red-700 hover:bg-red-500/10 hover:text-red-800"
                aria-label={t("scientificFieldsView.clearSearch")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <button
            aria-label={t("scientificFieldsView.openFilters")}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-patras-buccaneer text-white font-medium text-sm shadow-sm hover:bg-patras-sanguineBrown transition border border-patras-buccaneer"
            onClick={() => setFilterOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A2 2 0 0013 14.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-2.586a2 2 0 00-.586-1.414L3 6.707A1 1 0 013 6V4z"/>
            </svg>
            {t("scientificFieldsView.filters")}
          </button>
        </div>
      </div>

      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        isAdmin={isAdmin}
        showScientificFields={false}
        pointsLabel={t("scientificFieldsView.pointsLabel")}
        title={t("scientificFieldsView.filterModalTitle")}
        titleClassName="text-gray-900 dark:text-[var(--color-text-primary)]"
        showDateRanges
        dateRangeFields={[
          { key: "startDate", label: t("scientificFieldsView.dateStart") },
          { key: "endDate", label: t("scientificFieldsView.dateEnd") },
        ]}
        onReset={() => setFilters({
          schools: [],
          departments: [],
          status: [],
          pointsMin: "",
          pointsMax: "",
          dateRanges: {
            startDate: { from: "", to: "" },
            endDate: { from: "", to: "" },
          },
        })}
      />

      <div className="relative overflow-visible">
        <SortableTable
          columns={columns}
          rows={filteredRows}
          searchableColumns={["scientificField", "school", "department", "state"]}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          showSearchBar={false}
          loading={loading}
          loadingMessage={t("scientificFieldsView.loading")}
          emptyMessage={t("scientificFieldsView.empty")}
          tbodyClassName="divide-y divide-patras-cameo text-[13px] [&_tr]:transition-none [&_td]:text-patras-buccaneer dark:[&_td]:text-[var(--color-text-primary)]"
          headerCellClassName="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider cursor-pointer select-none"
          initialSortBy="state"
          initialSortDirection="desc"
          getSortedRows={getSortedRows}
          renderRow={(row, key) => {
            const fieldLink = buildFieldLink(row);
            return (
              <tr key={key} className="hover:bg-patras-albescentWhite/50">
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                  <Link
                    to={fieldLink}
                    state={{ scientificFieldName: row.scientificField }}
                    className="block w-full h-full px-6 py-4"
                  >
                    {row.scientificField || "—"}
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                  <Link
                    to={fieldLink}
                    state={{ scientificFieldName: row.scientificField }}
                    className="block w-full h-full px-6 py-4"
                  >
                    {row.school || "—"}
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                  <Link
                    to={fieldLink}
                    state={{ scientificFieldName: row.scientificField }}
                    className="block w-full h-full px-6 py-4"
                  >
                    {row.department || "—"}
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                  <Link
                    to={fieldLink}
                    state={{ scientificFieldName: row.scientificField }}
                    className="block w-full h-full px-6 py-4"
                  >
                    <span className={getStateBadgeClasses(row.stateKey)}>{row.state}</span>
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap">
                  <Link
                    to={fieldLink}
                    state={{ scientificFieldName: row.scientificField }}
                    className="block w-full h-full px-6 py-4"
                  >
                    {row.applicants}
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap">
                  <Link
                    to={fieldLink}
                    state={{ scientificFieldName: row.scientificField }}
                    className="block w-full h-full px-6 py-4"
                  >
                    {formatDateTimeCell(row.startDate, row.startTime, "00:00")}
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap">
                  <Link
                    to={fieldLink}
                    state={{ scientificFieldName: row.scientificField }}
                    className="block w-full h-full px-6 py-4"
                  >
                    {formatDateTimeCell(row.endDate, row.endTime, "23:59")}
                  </Link>
                </td>
              </tr>
            );
          }}
        />
      </div>
    </div>
  );
}
