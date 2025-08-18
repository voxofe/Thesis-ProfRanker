import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const columns = [
  { key: "firstName", label: "Όνομα" },
  { key: "lastName", label: "Επώνυμο" },
  { key: "scientificField", label: "Επιστημονικό Πεδίο" },
  { key: "submitDate", label: "Ημερομηνία υποβολής" },
  { key: "totalPoints", label: "Βαθμολόγηση (σε μόρια)" },
];

export default function RankingPage() {
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState("totalPoints");
  const [sortDirection, setSortDirection] = useState("desc");
  const navigate = useNavigate();

  useEffect(() => {
    axios({
      method: "GET",
      url: "http://localhost:8000/api/applicant/all",
    })
      .then((response) => {
        // Initial sort: highest totalPoints first
        const sorted = [...response.data].sort((a, b) => b.totalPoints - a.totalPoints);
        setUsers(sorted);
      })
      .catch((error) => {
        console.error("Error fetching ranking data:", error);
      });
  }, []);

  // Sorting function
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const getSortedUsers = () => {
    return [...users].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // For numbers
      if (sortBy === "totalPoints") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      // For dates
      if (sortBy === "submitDate") {
        // Format: "16-08-2025 16:30"
        const parseDate = (str) => {
          const [date, time] = str.split(" ");
          const [d, m, y] = date.split("-");
          return new Date(`${y}-${m}-${d}T${time}:00`);
        };
        const dateA = parseDate(valA);
        const dateB = parseDate(valB);
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      // For strings
      valA = valA?.toString().toLowerCase() || "";
      valB = valB?.toString().toLowerCase() || "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedUsers = getSortedUsers();

  const renderSortArrow = (key) => {
    if (sortBy !== key) return null;
    return sortDirection === "asc" ? (
      <span className="ml-2 text-base text-white align-middle">
        {"\u25B2"} {/* ▲ up arrow */}
      </span>
    ) : (
      <span className="ml-2 text-base text-white align-middle">
        {"\u25BC"} {/* ▼ down arrow */}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 ">
      <h1 className="text-2xl border-b mb-10 pb-2 text-gray-700">
        Λίστα Κατάταξης Υποψηφίων
      </h1>
      <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50">
        <table className="min-w-full bg-white/25 t-5">
          <thead className="bg-patras-buccaneer">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {renderSortArrow(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-patras-cameo">
            {sortedUsers.map((applicant) => (
              <tr
                onClick={() => navigate(`/score/applicant/${applicant.id}`)}
                key={applicant.id}
                className="cursor-pointer hover:bg-patras-albescentWhite/50"
              >
                <td className="px-6 py-4 text-center text-patras-buccaneer ">
                  {applicant.firstName}
                </td>
                <td className="px-6 py-4 text-center text-patras-buccaneer">
                  {applicant.lastName}
                </td>
                <td className="px-6 py-4 text-center text-patras-buccaneer">
                  {applicant.scientificField}
                </td>
                <td className="px-6 py-4 text-center text-patras-buccaneer">
                  {applicant.submitDate}
                </td>
                <td className="px-6 py-4 text-center text-patras-buccaneer">
                  {applicant.totalPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
