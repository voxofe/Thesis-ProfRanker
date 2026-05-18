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

export default function PositionsEdit() {
  const { currentUser } = useAuth();
  const { positions = [], loading } = usePositions();
  const [applicants, setApplicants] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    schools: [],
    departments: [],
    scientificFields: [],
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
        raw: pos,
      };
    });
  }, [positions, applicantCounts]);

  const pendingRows = useMemo(
    () => rows.filter((row) => row.state === "Προσεχής"),
    [rows]
  );

  const filterOptions = useMemo(() => {
    const schools = [...new Set(pendingRows.map((r) => r.school).filter(Boolean))];
    const departments = [...new Set(pendingRows.map((r) => r.department).filter(Boolean))];
    const scientificFields = [...new Set(pendingRows.map((r) => r.scientificField).filter(Boolean))];
    return {
      schools,
      departments,
      scientificFields,
      statuses: ["Προσεχής"],
    };
  }, [pendingRows]);

  useEffect(() => {
    const params = {};
    if (filters.schools.length) params.school = filters.schools.join(",");
    if (filters.departments.length) params.department = filters.departments.join(",");
    if (filters.scientificFields.length) params.scientificField = filters.scientificFields.join(",");
    setSearchParams(params);
  }, [filters, setSearchParams]);

  useEffect(() => {
    const params = Object.fromEntries([...searchParams.entries()]);
    setFilters((prev) => ({
      ...prev,
      schools: params.school ? params.school.split(",") : [],
      departments: params.department ? params.department.split(",") : [],
      scientificFields: params.scientificField ? params.scientificField.split(",") : [],
    }));
    // eslint-disable-next-line
  }, []);

  const filteredRows = useMemo(() => {
    return pendingRows.filter((r) => {
      if (filters.schools.length && !filters.schools.includes(r.school)) return false;
      if (filters.departments.length && !filters.departments.includes(r.department)) return false;
      if (filters.scientificFields.length && !filters.scientificFields.includes(r.scientificField)) return false;
      return true;
    });
  }, [pendingRows, filters]);

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
      return [...rows].sort((a, b) => {
        const ra = a.state === "Προσεχής" ? 1 : 0;
        const rb = b.state === "Προσεχής" ? 1 : 0;
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
    return tags;
  }, [filters]);

  const removeTag = (tag) => {
    setFilters((prev) => {
      if (["schools", "departments", "scientificFields"].includes(tag.key)) {
        return { ...prev, [tag.key]: prev[tag.key].filter((v) => v !== tag.value) };
      }
      return prev;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-y-5 pt-0">
      <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-800">
        Επεξεργασία θέσεων
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
        showStatus={false}
        showPoints={false}
        onReset={() => setFilters({
          schools: [],
          departments: [],
          scientificFields: [],
        })}
      />

      <div className="relative overflow-visible">
        <div className="absolute -top-12 right-0 z-50 flex items-center gap-2">
          <div className="relative w-56">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
              </svg>
            </span>
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Αναζήτηση θέσεων..."
              className="w-full rounded-md border border-patras-capePalliser/50 bg-white/90 py-1.5 pl-9 pr-3 text-sm text-gray-800 shadow-sm focus:border-patras-buccaneer focus:outline-none"
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
        <SortableTable
          columns={columns}
          rows={filteredRows}
          searchableColumns={["scientificField", "school", "department", "state"]}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          showSearchBar={false}
          loading={loading}
          loadingMessage="Φόρτωση θέσεων..."
          emptyMessage="Δεν υπάρχουν διαθέσιμες προσεχείς θέσεις."
          headerCellClassName="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider cursor-pointer select-none"
          initialSortBy="scientificField"
          initialSortDirection="asc"
          getSortedRows={getSortedRows}
          renderRow={(row, key) => (
            <tr key={key} className="hover:bg-patras-albescentWhite/50">
              <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                <Link to="/positions/create" state={{ prefillPosition: row.raw }} className="block w-full h-full px-6 py-4">
                  {row.scientificField || "—"}
                </Link>
              </td>
              <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                <Link to="/positions/create" state={{ prefillPosition: row.raw }} className="block w-full h-full px-6 py-4">
                  {row.school || "—"}
                </Link>
              </td>
              <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                <Link to="/positions/create" state={{ prefillPosition: row.raw }} className="block w-full h-full px-6 py-4">
                  {row.department || "—"}
                </Link>
              </td>
              <td className="text-center text-patras-buccaneer text-[13px] whitespace-normal break-words">
                <Link to="/positions/create" state={{ prefillPosition: row.raw }} className="block w-full h-full px-6 py-4">
                  <span className={getStateBadgeClasses(row.state)}>{row.state}</span>
                </Link>
              </td>
              <td className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap">
                <Link to="/positions/create" state={{ prefillPosition: row.raw }} className="block w-full h-full px-6 py-4">
                  {row.applicants}
                </Link>
              </td>
              <td className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap">
                <Link to="/positions/create" state={{ prefillPosition: row.raw }} className="block w-full h-full px-6 py-4">
                  {formatDateTimeCell(row.startDate, row.startTime, "00:00")}
                </Link>
              </td>
              <td className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap">
                <Link to="/positions/create" state={{ prefillPosition: row.raw }} className="block w-full h-full px-6 py-4">
                  {formatDateTimeCell(row.endDate, row.endTime, "23:59")}
                </Link>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}
