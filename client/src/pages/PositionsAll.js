import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePositions } from "../contexts/PositionsContext";
import FilterModal from "../components/FilterModal";
import SortableTable, { formatDateTimeCell } from "../components/SortableTable";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

const stateLabels = {
  pending: "Προσεχής",
  active: "Ενεργή",
  completed: "Ολοκληρωμένη",
};

const columns = [
  { key: "scientificField", label: "Επιστημονικό πεδίο" },
  { key: "school", label: "Σχολή" },
  { key: "department", label: "Τμήμα" },
  { key: "state", label: "Κατάσταση" },
  { key: "applicants", label: "Αιτήσεις" },
  { key: "startDate", label: "Έναρξη" },
  { key: "endDate", label: "Λήξη" },
];

function getStateBadgeClasses(state) {
  const base =
    "inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold";
  if (state === "Ενεργή") return `${base} bg-yellow-100 text-yellow-800 border border-yellow-200`;
  if (state === "Ολοκληρωμένη") return `${base} bg-green-100 text-green-800 border border-green-200`;
  if (state === "Προσεχής") return `${base} bg-gray-100 text-gray-700 border border-gray-200`;
  return `${base} bg-gray-100 text-gray-700 border border-gray-200`;
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

export default function PositionsTable() {
  const { currentUser } = useAuth();
  const { positions = [], loading } = usePositions();
  const [applicants, setApplicants] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    schools: [],
    departments: [],
    scientificFields: [],
    status: [],
    pointsMin: "",
    pointsMax: "",
  });
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = !!(
    currentUser?.isAdmin ||
    currentUser?.role === "admin" ||
    currentUser?.is_staff ||
    currentUser?.is_superuser
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios({
      method: "GET",
      url: `${API_BASE_URL}/api/applicant/all`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => setApplicants(response.data || []))
      .catch((error) => {
        console.error("Error fetching applicants list:", error);
        setApplicants([]);
      });
  }, []);

  const applicantCounts = useMemo(() => {
    return (applicants || []).reduce((acc, applicant) => {
      const key = applicant?.scientificField || "";
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [applicants]);

  const rows = useMemo(() => {
    return (positions || []).map((pos) => {
      const startDate = parseIsoDateTime(pos.startDate, pos.startTime);
      const endDate = parseIsoDateTime(pos.endDate, pos.endTime);
      return {
        id: pos.id,
        scientificField: pos.scientificField,
        school: pos.school,
        department: pos.department,
        state: stateLabels[pos.state] || "—",
        applicants: applicantCounts[pos.scientificField] || 0,
        startDate: pos.startDate || "",
        endDate: pos.endDate || "",
        startTime: pos.startTime || "",
        endTime: pos.endTime || "",
        _startDate: startDate,
        _endDate: endDate,
      };
    });
  }, [positions, applicantCounts]);

  const filterOptions = useMemo(() => {
    const schools = [...new Set(rows.map((r) => r.school).filter(Boolean))];
    const departments = [...new Set(rows.map((r) => r.department).filter(Boolean))];
    const scientificFields = [...new Set(rows.map((r) => r.scientificField).filter(Boolean))];
    const statuses = [...new Set(rows.map((r) => r.state).filter(Boolean))];
    return {
      schools,
      departments,
      scientificFields,
      statuses,
    };
  }, [rows]);

  useEffect(() => {
    const params = {};
    if (filters.schools.length) params.school = filters.schools.join(",");
    if (filters.departments.length) params.department = filters.departments.join(",");
    if (filters.scientificFields.length) params.scientificField = filters.scientificFields.join(",");
    if (filters.status.length) params.status = filters.status.join(",");
    if (filters.pointsMin) params.pointsMin = filters.pointsMin;
    if (filters.pointsMax) params.pointsMax = filters.pointsMax;
    setSearchParams(params);
  }, [filters, setSearchParams]);

  useEffect(() => {
    const params = Object.fromEntries([...searchParams.entries()]);
    setFilters((prev) => ({
      ...prev,
      schools: params.school ? params.school.split(",") : [],
      departments: params.department ? params.department.split(",") : [],
      scientificFields: params.scientificField ? params.scientificField.split(",") : [],
      status: params.status ? params.status.split(",") : [],
      pointsMin: params.pointsMin || "",
      pointsMax: params.pointsMax || "",
    }));
    // eslint-disable-next-line
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filters.schools.length && !filters.schools.includes(r.school)) return false;
      if (filters.departments.length && !filters.departments.includes(r.department)) return false;
      if (filters.scientificFields.length && !filters.scientificFields.includes(r.scientificField)) return false;
      if (filters.status.length && !filters.status.includes(r.state)) return false;
      if (filters.pointsMin && Number(r.applicants) < Number(filters.pointsMin)) return false;
      if (filters.pointsMax && Number(r.applicants) > Number(filters.pointsMax)) return false;
      return true;
    });
  }, [rows, filters]);

  const getSortedRows = useMemo(() => (rows, sortBy, sortDirection) => {
    const byDate = (a, b, key) => {
      const da = a[key];
      const db = b[key];
      if (!da && !db) return 0;
      if (!da) return sortDirection === "asc" ? -1 : 1;
      if (!db) return sortDirection === "asc" ? 1 : -1;
      return sortDirection === "asc" ? da - db : db - da;
    };

    if (sortBy === "startDate") {
      return [...rows].sort((a, b) => byDate(a, b, "_startDate"));
    }

    if (sortBy === "endDate") {
      return [...rows].sort((a, b) => byDate(a, b, "_endDate"));
    }

    if (sortBy === "applicants") {
      return [...rows].sort((a, b) =>
        sortDirection === "asc" ? a.applicants - b.applicants : b.applicants - a.applicants
      );
    }

    if (sortBy === "state") {
      const rank = (value) => {
        if (value === "Ενεργή") return 2;
        if (value === "Ολοκληρωμένη") return 1;
        if (value === "Προσεχής") return 0;
        return -1;
      };
      return [...rows].sort((a, b) => {
        const ra = rank(a.state);
        const rb = rank(b.state);
        if (ra === rb) return 0;
        return sortDirection === "asc" ? ra - rb : rb - ra;
      });
    }

    return [...rows].sort((a, b) => {
      const valA = a[sortBy]?.toString().toLowerCase() || "";
      const valB = b[sortBy]?.toString().toLowerCase() || "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, []);

  const filterTags = useMemo(() => {
    const tags = [];
    filters.schools.forEach((s) => tags.push({ key: "schools", value: s, label: `Σχολή: ${s}` }));
    filters.departments.forEach((d) => tags.push({ key: "departments", value: d, label: `Τμήμα: ${d}` }));
    filters.scientificFields.forEach((sf) => tags.push({ key: "scientificFields", value: sf, label: `Επιστημονικό πεδίο: ${sf}` }));
    filters.status.forEach((st) => tags.push({ key: "status", value: st, label: `Κατάσταση: ${st}` }));
    if (filters.pointsMin) tags.push({ key: "pointsMin", value: filters.pointsMin, label: `Πλήθος αιτήσεων ≥ ${filters.pointsMin}` });
    if (filters.pointsMax) tags.push({ key: "pointsMax", value: filters.pointsMax, label: `Πλήθος αιτήσεων ≤ ${filters.pointsMax}` });
    return tags;
  }, [filters]);

  const removeTag = (tag) => {
    setFilters((prev) => {
      if (["schools", "departments", "scientificFields", "status"].includes(tag.key)) {
        return { ...prev, [tag.key]: prev[tag.key].filter((v) => v !== tag.value) };
      }
      if (tag.key === "pointsMin") return { ...prev, pointsMin: "" };
      if (tag.key === "pointsMax") return { ...prev, pointsMax: "" };
      return prev;
    });
  };

  const buildRankingLink = (row) => {
    const params = new URLSearchParams();
    if (row.school) params.set("school", row.school);
    if (row.department) params.set("department", row.department);
    if (row.scientificField) params.set("scientificField", row.scientificField);
    return `/ranking?${params.toString()}`;
  };

  return (
    <div className="grid grid-cols-1 gap-y-5 pt-5">
      <h1 className="text-2xl text-center border-b  pb-2 mb-6 text-gray-700">
        Θέσεις προγράμματος
      </h1>
      <div className="flex items-center justify-between ml-1 m-0 p-0">
        <div>
          {filterTags.length > 0 && (
            <div className="flex flex-wrap gap-2 pr-24">
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
            </div>
          )}
        </div>
      </div>

      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        isAdmin={isAdmin}
        pointsLabel="Εύρος πλήθους αιτήσεων"
        title="Φίλτρα Θέσεων"
        titleClassName="text-gray-900"
        onReset={() => setFilters({
          schools: [],
          departments: [],
          scientificFields: [],
          status: [],
          pointsMin: "",
          pointsMax: "",
        })}
      />

      <div className="relative overflow-visible">
        <button
          aria-label="Άνοιγμα φίλτρων"
          className="absolute -top-12 right-0 z-50 flex items-center gap-2 px-3 py-1 rounded-full bg-patras-buccaneer text-white font-medium text-sm shadow-sm hover:bg-patras-sanguineBrown transition border border-patras-buccaneer"
          onClick={() => setFilterOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A2 2 0 0013 14.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-2.586a2 2 0 00-.586-1.414L3 6.707A1 1 0 013 6V4z"/>
          </svg>
          Φίλτρα
        </button>
        <SortableTable
          columns={columns}
          rows={filteredRows}
          loading={loading}
          loadingMessage="Φόρτωση θέσεων..."
          emptyMessage="Δεν υπάρχουν διαθέσιμες θέσεις."
          headerCellClassName="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider cursor-pointer select-none"
          initialSortBy="state"
          initialSortDirection="desc"
          getSortedRows={getSortedRows}
          renderRow={(row, key) => {
            const rankingLink = buildRankingLink(row);
            return (
              <tr key={key} className="hover:bg-patras-albescentWhite/50">
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                  <Link to={rankingLink} className="block w-full h-full px-6 py-4">
                    {row.scientificField || "—"}
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                  <Link to={rankingLink} className="block w-full h-full px-6 py-4">
                    {row.school || "—"}
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                  <Link to={rankingLink} className="block w-full h-full px-6 py-4">
                    {row.department || "—"}
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                  <Link to={rankingLink} className="block w-full h-full px-6 py-4">
                    <span className={getStateBadgeClasses(row.state)}>{row.state}</span>
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap">
                  <Link to={rankingLink} className="block w-full h-full px-6 py-4">
                    {row.applicants}
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap">
                  <Link to={rankingLink} className="block w-full h-full px-6 py-4">
                    {formatDateTimeCell(row.startDate, row.startTime, "00:00")}
                  </Link>
                </td>
                <td className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap">
                  <Link to={rankingLink} className="block w-full h-full px-6 py-4">
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
