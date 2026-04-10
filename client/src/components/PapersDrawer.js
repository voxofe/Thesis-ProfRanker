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

  const getPaperPoints = (quartile) => {
    const q = String(quartile || "").trim().toUpperCase();
    if (q === "Q1") return 2;
    if (q === "Q2") return 1.6;
    return 0.4;
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Drawer Header */}
      <div
        className="flex items-center justify-between px-0 py-4 cursor-pointer bg-patras-[#fffbf6]"
        onClick={toggleDrawer}
      >
        <span className="flex items-center text-patras-buccaneer">
          Δημοσιεύσεις/ανακοινώσεις σε συνέδρια
          <span className="text-patras-buccaneer text-lg ml-2">
            {isOpen ? "▼" : "\u25B6\uFE0E"}
          </span>
        </span>
      </div>

      {/* Drawer Content */}
      {isOpen && (
        <div className="overflow-x-auto px-0 pb-4">
          <table className="min-w-full bg-[#fffbf6] border border-patras-cameo rounded-lg shadow-md">
            <thead className="bg-patras-buccaneer">
              <tr>
                <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Είδος
                </th>
                <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Τίτλος
                </th>
                <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Περιοδικό/Συνέδριο
                </th>
                <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Έτος
                </th>
                <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  ISSN
                </th>
                <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Χώρα
                </th>
                <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Quartile
                </th>
                <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider">
                  Μόρια
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-patras-cameo">
              {papers.map((paper, index) => (
                <tr key={index} className="">
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                    {paper.type === "journal"
                      ? "Περιοδικό"
                      : paper.type === "conference"
                      ? "Συνέδριο"
                      : paper.type === "other"
                      ? "Άλλο"
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                    {paper.paperTitle || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                    {paper.journalConfTitle || "-"}
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                    {paper.year || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                    <IssnCell issn={paper.issn} />
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                    {paper.country || ""}
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                    {paper.quartile || ""}
                  </td>
                  <td className="px-4 py-2 text-patras-buccaneer text-center align-middle text-[15px]">
                    {getPaperPoints(paper.quartile)}
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
