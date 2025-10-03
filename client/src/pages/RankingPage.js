import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePositions } from "../contexts/PositionsContext";
import RankingFilterModal from "./RankingFilterModal";
import Checkbox from "../components/Checkbox";

const columns = [
  { key: "firstName", label: "Όνομα" },
  { key: "lastName", label: "Επώνυμο" },
  { key: "school", label: "Σχολή" },
  { key: "department", label: "Τμήμα" },
  { key: "scientificField", label: "Επιστημονικό Πεδίο" },
  { key: "positionStartDate", label: "Έναρξη Αιτήσεων" },
  { key: "positionEndDate", label: "Λήξη Αιτήσεων" },
  { key: "status", label: "Κατάσταση Αιτήσεων" },
  { key: "totalPoints", label: "Βαθμολόγηση (σε μόρια)" },
];

const statusLabels = ["Ενεργή", "Ολοκληρωμένη"];

function parseDDMMYYYY(str) {
  if (!str) return null;
  const [datePart] = String(str).split(" ");
  const [d, m, y] = datePart.split("-").map((v) => parseInt(v, 10));
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

function getApplicationStatus(endDateStr) {
  const end = parseDDMMYYYY(endDateStr);
  if (!end) return "—";
  return end >= new Date() ? "Ενεργή" : "Ολοκληρωμένη";
}

function getStatusBadgeClasses(status) {
  const base =
    "inline-flex items-center justify-center rounded-full px-2 py-1 text-[10px] font-semibold";
  if (status === "Ενεργή") return `${base} bg-yellow-100 text-yellow-800 border border-yellow-200`;
  if (status === "Ολοκληρωμένη") return `${base} bg-green-100 text-green-800 border border-green-200`;
  return `${base} bg-gray-100 text-gray-700 border border-gray-200`;
}

export default function RankingPage() {
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState("totalPoints");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    schools: [],
    departments: [],
    scientificFields: [],
    status: [],
    pointsMin: "",
    pointsMax: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { positions = [] } = usePositions();

  // Roles
  const isAdmin = !!(
    currentUser?.isAdmin ||
    currentUser?.role === "admin" ||
    currentUser?.is_staff ||
    currentUser?.is_superuser
  );
  const isApplicant = !!currentUser && !isAdmin && currentUser?.role !== "guest";
  const viewerId = currentUser?.id;

  // Get applicant's position info
  const myPositionId = currentUser?.form?.positionId;
  const myPosition = positions.find(p => String(p.id) === String(myPositionId));
  const mySchool = myPosition?.school;
  const myDepartment = myPosition?.department;
  const myScientificField = myPosition?.scientificField;

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios({
      method: "GET",
      url: "http://localhost:8000/api/applicant/all",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching ranking data:", error);
      });
  }, []);

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
    }));
    // eslint-disable-next-line
  }, []);

  // Filter users client-side
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Role-based filter: only Ολοκληρωμένη for non-admins
      if (!isAdmin && getApplicationStatus(u.positionEndDate) !== "Ολοκληρωμένη") return false;
      // School
      if (filters.schools.length && !filters.schools.includes(u.school)) return false;
      // Department
      if (filters.departments.length && !filters.departments.includes(u.department)) return false;
      // Scientific Field
      if (filters.scientificFields.length && !filters.scientificFields.includes(u.scientificField)) return false;
      // Status (admin only)
      if (isAdmin && filters.status.length && !filters.status.includes(getApplicationStatus(u.positionEndDate))) return false;
      // Points range
      if (filters.pointsMin && Number(u.totalPoints) < Number(filters.pointsMin)) return false;
      if (filters.pointsMax && Number(u.totalPoints) > Number(filters.pointsMax)) return false;
      return true;
    });
  }, [users, filters, isAdmin]);

  // Sorting
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const getSortedUsers = () => {
    const byDate = (a, b, key) => {
      const da = parseDDMMYYYY(a[key]);
      const db = parseDDMMYYYY(b[key]);
      if (!da && !db) return 0;
      if (!da) return sortDirection === "asc" ? -1 : 1;
      if (!db) return sortDirection === "asc" ? 1 : -1;
      return sortDirection === "asc" ? da - db : db - da;
    };

    if (sortBy === "totalPoints") {
      return [...filteredUsers].sort((a, b) =>
        sortDirection === "asc" ? a.totalPoints - b.totalPoints : b.totalPoints - a.totalPoints
      );
    }

    if (sortBy === "positionStartDate" || sortBy === "positionEndDate") {
      return [...filteredUsers].sort((a, b) => byDate(a, b, sortBy));
    }

    if (sortBy === "status") {
      const rank = (u) => {
        const s = getApplicationStatus(u.positionEndDate);
        if (s === "Ενεργή") return 2;
        if (s === "Ολοκληρωμένη") return 1;
        return 0;
      };
      return [...filteredUsers].sort((a, b) => {
        const ra = rank(a);
        const rb = rank(b);
        if (ra === rb) {
          const da = parseDDMMYYYY(a.positionEndDate);
          const db = parseDDMMYYYY(b.positionEndDate);
          if (!da && !db) return 0;
          if (!da) return sortDirection === "asc" ? -1 : 1;
          if (!db) return sortDirection === "asc" ? 1 : -1;
          return sortDirection === "asc" ? da - db : db - da;
        }
        return sortDirection === "asc" ? ra - rb : rb - ra;
      });
    }

    // String fields
    return [...filteredUsers].sort((a, b) => {
      const valA = a[sortBy]?.toString().toLowerCase() || "";
      const valB = b[sortBy]?.toString().toLowerCase() || "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedUsers = getSortedUsers();

  // Filter tags
  const filterTags = useMemo(() => {
    const tags = [];
    filters.schools.forEach(s => tags.push({ key: "schools", value: s, label: `Σχολή: ${s}` }));
    filters.departments.forEach(d => tags.push({ key: "departments", value: d, label: `Τμήμα: ${d}` }));
    filters.scientificFields.forEach(sf => tags.push({ key: "scientificFields", value: sf, label: `Επιστημονικό Πεδίο: ${sf}` }));
    if (isAdmin) filters.status.forEach(st => tags.push({ key: "status", value: st, label: `Κατάσταση: ${st}` }));
    if (filters.pointsMin) tags.push({ key: "pointsMin", value: filters.pointsMin, label: `Μόρια ≥ ${filters.pointsMin}` });
    if (filters.pointsMax) tags.push({ key: "pointsMax", value: filters.pointsMax, label: `Μόρια ≤ ${filters.pointsMax}` });
    return tags;
  }, [filters, isAdmin]);

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

  // Applicant: checkbox to show only their position's applications
  const [showMyPosition, setShowMyPosition] = useState(false);
  const filteredByMyPosition = useMemo(() => {
    if (isApplicant && showMyPosition && myPositionId) {
      return sortedUsers.filter(u => String(u.positionId) === String(myPositionId));
    }
    return sortedUsers;
  }, [isApplicant, showMyPosition, myPositionId, sortedUsers]);

  // Checkbox is checked only if all three filters contain ONLY the applicant's values
  const hasMyExclusiveFilters =
    myScientificField &&
    myDepartment &&
    mySchool &&
    filters.scientificFields.length === 1 &&
    filters.scientificFields[0] === myScientificField &&
    filters.departments.length === 1 &&
    filters.departments[0] === myDepartment &&
    filters.schools.length === 1 &&
    filters.schools[0] === mySchool;

  const handleMyFieldCheckbox = (checked) => {
    setFilters((prev) => {
      if (checked && myScientificField && myDepartment && mySchool) {
        // Set ONLY the applicant's scientific field, department, and school
        return {
          ...prev,
          scientificFields: [myScientificField],
          departments: [myDepartment],
          schools: [mySchool],
        };
      }
      if (!checked) {
        // Remove applicant's values, keep others if present
        return {
          ...prev,
          scientificFields: prev.scientificFields.filter(f => f !== myScientificField),
          departments: prev.departments.filter(d => d !== myDepartment),
          schools: prev.schools.filter(s => s !== mySchool),
        };
      }
      return prev;
    });
  };

  const renderSortArrow = (key) => {
    if (sortBy !== key) return null;
    return sortDirection === "asc" ? (
      <span className="ml-2 text-base text-white align-middle">
        {"\u25B2"}
      </span>
    ) : (
      <span className="ml-2 text-base text-white align-middle">
        {"\u25BC"}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-y-5 pt-5"> 
      <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-700">
        Λίστα Κατάταξης Υποψηφίων
      </h1>

      {/* Filters row: Checkbox + Φίλτρα button */}
      <div className="flex items-center justify-between ml-1 m-0 p-0">
        {/* Left side: Checkbox for applicant only */}
        <div>
          {isApplicant && myScientificField && myDepartment && mySchool && (
            <Checkbox
              id="show-my-field"
              name="show-my-field"
              checked={hasMyExclusiveFilters}
              onChange={handleMyFieldCheckbox}
              label="Εμφάνιση αιτήσεων μόνο για τη θέση που έχω επιλέξει"
            />
          )}
          {/* For guest/admin, tags appear here */}
          {(isAdmin || currentUser?.role === "guest") && filterTags.length > 0 && (
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
        {/* Right side: (button moved to be positioned relative to the table) */}
      </div>

      {/* For applicant, tags appear below the row */}
      {isApplicant && filterTags.length > 0 && (
        <div className=" flex flex-wrap gap-2 pr-24">
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

      {/* Filter Modal */}
      <RankingFilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        isAdmin={isAdmin}
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
        {/* Positioned Filters button: placed outside the scrollable area so it won't be clipped */}
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
        <div className="w-full overflow-x-auto overflow-y-visible shadow-md rounded-lg border border-patras-capePalliser/50">
        <table className="min-w-full table-fixed font-semibold bg-white/25 t-5"> {/* Changed to min-w-full */}
          <thead className="bg-patras-buccaneer">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    "px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider cursor-pointer select-none",
                    col.key === "firstName" || col.key === "lastName" ? "w-24" : "",
                    col.key === "status" ? "w-28" : "",
                  ].join(" ").trim()}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {renderSortArrow(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-patras-cameo">
            {filteredByMyPosition.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-gray-400 py-8">
                  Δεν βρέθηκαν αποτελέσματα με βάση τα φίλτρα σας.
                </td>
              </tr>
            ) : (
              filteredByMyPosition.map((applicant) => {
                const isSelf = isApplicant && applicant.id === viewerId;
                const clickable = isAdmin || isSelf;
                return (
                  <tr
                    // navigation is handled by per-cell <Link> so middle-click/ctrl+click open in new tab
                    onClick={undefined}
                    key={applicant.id}
                    className={[
                      clickable ? "cursor-pointer hover:bg-patras-albescentWhite/50" : "cursor-default",
                      isSelf ? "bg-patras-sanguineBrown/10 relative" : ""
                    ].join(" ")}
                  >
                        <td
                          className="text-center text-patras-buccaneer text-xs whitespace-nowrap truncate w-24"
                          title={applicant.firstName}
                        >
                          {clickable ? (
                            <Link to={`/score/applicant/${applicant.id}`} className="block w-full h-full px-6 py-4">
                              {applicant.firstName}
                            </Link>
                          ) : (
                            <div className="px-6 py-4">{applicant.firstName}</div>
                          )}
                        </td>
                    <td
                      className="text-center text-patras-buccaneer text-xs whitespace-nowrap truncate w-24"
                      title={applicant.lastName}
                    >
                      {clickable ? (
                        <Link to={`/score/applicant/${applicant.id}`} className="block w-full h-full px-6 py-4">
                          {applicant.lastName}
                        </Link>
                      ) : (
                        <div className="px-6 py-4">{applicant.lastName}</div>
                      )}
                    </td>
                    <td className="text-center text-patras-buccaneer text-xs whitespace-normal break-words">
                      {clickable ? (
                        <Link to={`/score/applicant/${applicant.id}`} className="block w-full h-full px-6 py-4">
                          {applicant.school}
                        </Link>
                      ) : (
                        <div className="px-6 py-4">{applicant.school}</div>
                      )}
                    </td>
                    <td className="text-center text-patras-buccaneer text-xs whitespace-normal break-words">
                      {clickable ? (
                        <Link to={`/score/applicant/${applicant.id}`} className="block w-full h-full px-6 py-4">
                          {applicant.department}
                        </Link>
                      ) : (
                        <div className="px-6 py-4">{applicant.department}</div>
                      )}
                    </td>
                    <td className="text-center text-patras-buccaneer text-xs whitespace-normal break-words">
                      {clickable ? (
                        <Link to={`/score/applicant/${applicant.id}`} className="block w-full h-full px-6 py-4">
                          {applicant.scientificField}
                        </Link>
                      ) : (
                        <div className="px-6 py-4">{applicant.scientificField}</div>
                      )}
                    </td>
                    <td className="text-center text-patras-buccaneer text-xs whitespace-nowrap">
                      {clickable ? (
                        <Link to={`/score/applicant/${applicant.id}`} className="block w-full h-full px-6 py-4">
                          {applicant.positionStartDate}
                        </Link>
                      ) : (
                        <div className="px-6 py-4">{applicant.positionStartDate}</div>
                      )}
                    </td>
                    <td className="text-center text-patras-buccaneer text-xs whitespace-nowrap">
                      {clickable ? (
                        <Link to={`/score/applicant/${applicant.id}`} className="block w-full h-full px-6 py-4">
                          {applicant.positionEndDate}
                        </Link>
                      ) : (
                        <div className="px-6 py-4">{applicant.positionEndDate}</div>
                      )}
                    </td>
                    <td className="text-center text-patras-buccaneer text-xs whitespace-normal break-words w-28">
                      {(() => {
                        const status = getApplicationStatus(applicant.positionEndDate);
                        const content = <span className={getStatusBadgeClasses(status)}>{status}</span>;
                        return clickable ? (
                          <Link to={`/score/applicant/${applicant.id}`} className="block w-full h-full px-6 py-4">
                            {content}
                          </Link>
                        ) : (
                          <div className="px-6 py-4">{content}</div>
                        );
                      })()}
                    </td>
                    <td className="text-center">
                      {clickable ? (
                        <Link to={`/score/applicant/${applicant.id}`} className="block w-full h-full px-6 py-4">
                          <div className="flex justify-center">
                            <span className="inline-block min-w-[30px] px-3 py-1 rounded-md text-black font-semibold text-sm shadow-md ">
                              {applicant.totalPoints}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <div className="px-6 py-4">
                          <span className="inline-block min-w-[30px] px-3 py-1 rounded-md text-black font-semibold text-sm shadow-md">
                            {applicant.totalPoints}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
