import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SortableTable from "../components/SortableTable";
import FilterModal from "../components/FilterModal";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

const TAB_CONFIG = {
  applicants: {
    label: "Αιτούντες",
    role: "applicant",
    columns: [
      { key: "firstName", label: "Όνομα" },
      { key: "lastName", label: "Επώνυμο" },
      { key: "email", label: "Email" },
      { key: "mobileNumber", label: "Κινητό" },
      { key: "landlineNumber", label: "Σταθερό" },
      { key: "applicationsCount", label: "Αιτήσεις" },
    ],
    searchableColumns: ["firstName", "lastName", "email", "mobileNumber", "landlineNumber"],
    countKey: "applicationsCount",
    countLabel: "Αριθμός αιτήσεων",
  },
  guests: {
    label: "Επισκέπτες",
    role: "guest",
    columns: [
      { key: "firstName", label: "Όνομα" },
      { key: "lastName", label: "Επώνυμο" },
      { key: "email", label: "Email" },
      { key: "rankingVisits", label: "Επισκέψεις κατάταξης" },
    ],
    searchableColumns: ["firstName", "lastName", "email"],
    countKey: "rankingVisits",
    countLabel: "Επισκέψεις κατάταξης",
  },
  admins: {
    label: "Διαχειριστές",
    role: "admin",
    columns: [
      { key: "firstName", label: "Όνομα" },
      { key: "lastName", label: "Επώνυμο" },
      { key: "email", label: "Email" },
    ],
    searchableColumns: ["firstName", "lastName", "email"],
  },
};

const emptyFilters = { genders: [], pointsMin: "", pointsMax: "" };

export default function UsersView() {
  const [activeTab, setActiveTab] = useState("applicants");
  const [loading, setLoading] = useState(false);
  const [rowsByTab, setRowsByTab] = useState({
    applicants: [],
    guests: [],
    admins: [],
  });
  const [filtersByTab, setFiltersByTab] = useState({
    applicants: { ...emptyFilters },
    guests: { ...emptyFilters },
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [rowMenu, setRowMenu] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const tableWrapperRef = useRef(null);
  const navigate = useNavigate();
  const isApplicantsTab = activeTab === "applicants";
  const isGuestsTab = activeTab === "guests";

  const tabConfig = TAB_CONFIG[activeTab];

  const fetchUsers = useCallback(async (roleKey) => {
    const role = TAB_CONFIG[roleKey]?.role;
    if (!role) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios({
        method: "GET",
        url: `${API_BASE_URL}/api/users/list?role=${role}`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const users = response.data?.users || [];
      setRowsByTab((prev) => ({ ...prev, [roleKey]: users }));
    } catch (error) {
      console.error("Error fetching users list:", error);
      setRowsByTab((prev) => ({ ...prev, [roleKey]: [] }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers("applicants");
    fetchUsers("guests");
    fetchUsers("admins");
  }, [fetchUsers]);

  useEffect(() => {
    setRowMenu(null);
    setSelectedRowId(null);
  }, [activeTab]);

  useEffect(() => {
    if (!rowMenu) return undefined;
    const handleClickOutside = (event) => {
      if (!tableWrapperRef.current) return;
      if (!tableWrapperRef.current.contains(event.target)) {
        setRowMenu(null);
        setSelectedRowId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [rowMenu]);

  const filters = filtersByTab[activeTab] || emptyFilters;

  const filteredRows = useMemo(() => {
    const rows = rowsByTab[activeTab] || [];
    if (activeTab === "admins") return rows;
    const countKey = tabConfig.countKey;
    return rows.filter((row) => {
      if (filters.genders.length && !filters.genders.includes(row.gender)) return false;
      if (filters.pointsMin !== "" && Number(row[countKey] || 0) < Number(filters.pointsMin)) return false;
      if (filters.pointsMax !== "" && Number(row[countKey] || 0) > Number(filters.pointsMax)) return false;
      return true;
    });
  }, [rowsByTab, activeTab, filters, tabConfig.countKey]);

  const filterTags = useMemo(() => {
    if (activeTab === "admins") return [];
    const tags = [];
    filters.genders.forEach((g) => {
      const label = g === "male" ? "Άνδρας" : g === "female" ? "Γυναίκα" : g;
      tags.push({ key: "genders", value: g, label: `Φύλο: ${label}` });
    });
    if (filters.pointsMin) {
      tags.push({
        key: "pointsMin",
        value: filters.pointsMin,
        label: `${tabConfig.countLabel} ≥ ${filters.pointsMin}`,
      });
    }
    if (filters.pointsMax) {
      tags.push({
        key: "pointsMax",
        value: filters.pointsMax,
        label: `${tabConfig.countLabel} ≤ ${filters.pointsMax}`,
      });
    }
    return tags;
  }, [filters, tabConfig.countLabel, activeTab]);

  const removeTag = (tag) => {
    setFiltersByTab((prev) => {
      const current = prev[activeTab] || emptyFilters;
      if (tag.key === "genders") {
        return {
          ...prev,
          [activeTab]: {
            ...current,
            genders: current.genders.filter((g) => g !== tag.value),
          },
        };
      }
      if (tag.key === "pointsMin") {
        return {
          ...prev,
          [activeTab]: {
            ...current,
            pointsMin: "",
          },
        };
      }
      if (tag.key === "pointsMax") {
        return {
          ...prev,
          [activeTab]: {
            ...current,
            pointsMax: "",
          },
        };
      }
      return prev;
    });
  };

  const headerCellClassName = () => {
    const count = tabConfig.columns.length;
    const widthClass = count === 3 ? "w-1/3" : count === 5 ? "w-1/5" : "w-1/6";
    return [
      "px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider cursor-pointer select-none",
      widthClass,
    ].join(" ").trim();
  };

  const getSortedRows = useCallback((rows, sortBy, sortDirection) => {
    const numericKeys = new Set(["applicationsCount", "rankingVisits"]);
    return [...rows].sort((a, b) => {
      const valA = a?.[sortBy];
      const valB = b?.[sortBy];
      if (numericKeys.has(sortBy)) {
        const numA = Number(valA || 0);
        const numB = Number(valB || 0);
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }
      const strA = valA?.toString().toLowerCase() || "";
      const strB = valB?.toString().toLowerCase() || "";
      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, []);

  const formatGender = (value) => {
    if (value === "male") return "Άνδρας";
    if (value === "female") return "Γυναίκα";
    return "—";
  };

  const openRowMenu = (event, row) => {
    if (!tableWrapperRef.current) return;
    const rect = tableWrapperRef.current.getBoundingClientRect();
    setRowMenu({
      rowId: row.id,
      top: event.clientY - rect.top + 8,
      left: event.clientX - rect.left + 8,
      label: `${row.firstName || ""} ${row.lastName || ""}`.trim(),
    });
    setSelectedRowId(row.id);
  };

  const handleRowClick = (event, row) => {
    if (isApplicantsTab) {
      openRowMenu(event, row);
      return;
    }
    if (isGuestsTab) {
      navigate(`/profile/${row.id}`);
      return;
    }
  };

  const renderRow = (row, key) => (
    <tr
      key={key}
      className={`${
        isApplicantsTab || isGuestsTab ? "cursor-pointer" : "cursor-default"
      } ${
        isApplicantsTab && selectedRowId === row.id
          ? "bg-patras-albescentWhite/70"
          : isApplicantsTab || isGuestsTab
            ? "hover:bg-patras-albescentWhite/50"
            : ""
      }`}
      onClick={(event) => handleRowClick(event, row)}
    >
      {tabConfig.columns.map((col) => {
        let value = row[col.key];
        if (col.key === "gender") value = formatGender(value);
        if (col.key === "applicationsCount" || col.key === "rankingVisits") {
          value = Number.isFinite(Number(value)) ? value : 0;
        }
        return (
          <td
            key={col.key}
            className="text-center text-patras-buccaneer text-[13px] whitespace-nowrap truncate px-4 py-3"
            title={value ? String(value) : "—"}
          >
            {value || value === 0 ? value : "—"}
          </td>
        );
      })}
    </tr>
  );

  return (
    <div className="max-w-5xl mx-auto p-0">
      <div className="mb-4">
        <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-800">
          Λίστα χρηστών
        </h1>
      </div>

      <div className="flex items-center justify-center pb-4">
        <div className="inline-flex rounded-full border border-patras-buccaneer/40 bg-white">
          {Object.entries(TAB_CONFIG).map(([key, tab]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
                activeTab === key
                  ? "bg-patras-buccaneer text-white"
                  : "text-patras-buccaneer hover:bg-patras-albescentWhite"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2 grid grid-cols-[1fr_auto] items-end gap-3 min-h-[36px]">
        <div className="flex flex-wrap-reverse content-end gap-2 min-h-[28px] min-w-[12rem] self-end">
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
        <div className="flex items-center gap-2">
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
              placeholder="Αναζήτηση χρηστών..."
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
          {activeTab !== "admins" && (
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
          )}
        </div>
      </div>

      <div className="relative overflow-visible" ref={tableWrapperRef}>
        <SortableTable
          columns={tabConfig.columns}
          rows={filteredRows}
          searchableColumns={tabConfig.searchableColumns}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          showSearchBar={false}
          getSortedRows={getSortedRows}
          getRowKey={(row) => row?.id}
          initialSortBy="lastName"
          initialSortDirection="asc"
          headerCellClassName={headerCellClassName}
          loading={loading}
          emptyMessage="Δεν βρέθηκαν αποτελέσματα με βάση τα φίλτρα σας."
          renderRow={renderRow}
        />
        {rowMenu && isApplicantsTab && (
          <div
            className="absolute z-50 w-max min-w-[14rem] rounded-md border border-gray-200 bg-white shadow-lg"
            style={{ top: rowMenu.top, left: rowMenu.left }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                navigate(`/my-applications/${rowMenu.rowId}`);
                setRowMenu(null);
                setSelectedRowId(null);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-patras-buccaneer hover:text-white whitespace-nowrap"
            >
              {`Αιτήσεις χρήστη: ${rowMenu.label || ""}`.trim()}
            </button>
            <button
              type="button"
              onClick={() => {
                navigate(`/profile/${rowMenu.rowId}`);
                setRowMenu(null);
                setSelectedRowId(null);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-patras-buccaneer hover:text-white whitespace-nowrap"
            >
              {`Φάκελος χρήστη: ${rowMenu.label || ""}`.trim()}
            </button>
          </div>
        )}
      </div>

      {activeTab !== "admins" && (
        <FilterModal
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          title={`Φίλτρα - ${tabConfig.label}`}
          filters={filters}
          setFilters={(next) =>
            setFiltersByTab((prev) => ({
              ...prev,
              [activeTab]: next,
            }))
          }
          options={{
            genders: [
              { value: "male", label: "Άνδρας" },
              { value: "female", label: "Γυναίκα" },
            ],
          }}
          pointsLabel={tabConfig.countLabel}
          showSchools={false}
          showDepartments={false}
          showScientificFields={false}
          showStatus={false}
          showGender={true}
          onReset={() =>
            setFiltersByTab((prev) => ({
              ...prev,
              [activeTab]: { ...emptyFilters },
            }))
          }
        />
      )}
    </div>
  );
}
