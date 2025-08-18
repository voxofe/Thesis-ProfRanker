import React, { useState } from "react";

function IssnCell({ issn }) {
  const hasWrong = issn && issn.toLowerCase().includes("wrong");
  const cleanIssn = hasWrong ? issn.replace(/\(wrong\)/gi, "").trim() : issn;

  return (
    <div className="flex items-center justify-center relative">
      <span>{cleanIssn}</span>
      {hasWrong && (
        <span className="ml-2 group relative flex items-center">
          {/* Notification mark */}
          <svg
            className="w-4 h-4 text-red-500 cursor-pointer"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <circle cx="10" cy="10" r="10" />
            <text
              x="10"
              y="15"
              textAnchor="middle"
              fontSize="12"
              fill="white"
              fontFamily="Arial"
            >
              !
            </text>
          </svg>
          {/* Tooltip */}
          <span className="absolute left-6 top-1 z-10 hidden group-hover:block bg-white border border-red-400 text-red-600 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            Το ISSN δεν βρέθηκε 
          </span>
        </span>
      )}
    </div>
  );
}

export default function PapersDrawer({ papers }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Drawer Header */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer bg-patras-[#fffbf6]"
        onClick={toggleDrawer}
      >
        <span className="flex items-center text-patras-buccaneer">
          Δημοσιεύσεις/Ανακοινώσεις σε συνέδρια
          <span className="text-patras-buccaneer text-lg ml-2">
            {isOpen ? "▼" : "\u25B6\uFE0E"}
          </span>
        </span>
      </div>

      {/* Drawer Content */}
      {isOpen && (
        <div className="overflow-x-auto px-6 pb-4">
          <table className="min-w-full bg-[#fffbf6] border border-patras-cameo rounded-lg shadow-md">
            <thead className="bg-patras-buccaneer">
              <tr>
                <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Είδος
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Τίτλος
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Περιοδικό/Συνέδριο
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Έτος
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  ISSN
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Χώρα
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wider">
                  Quartile
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-patras-cameo">
              {papers.map((paper, index) => (
                <tr key={index} className="">
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                    {paper.type === "journal"
                      ? "Περιοδικό"
                      : paper.type === "conference"
                      ? "Συνέδριο"
                      : paper.type === "other"
                      ? "Άλλο"
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                    {paper.paperTitle || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                    {paper.journalConfTitle || "-"}
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                    {paper.year || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                    <IssnCell issn={paper.issn} />
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                    {paper.country || ""}
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle">
                    {paper.quartile || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
