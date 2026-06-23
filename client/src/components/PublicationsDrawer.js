import React, { useMemo, useState } from "react";

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
          <span className="absolute left-6 top-1 z-10 hidden group-hover:block bg-white dark:bg-[var(--color-bg-card)] border border-red-400 text-red-600 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            Το ISSN δεν βρέθηκε 
          </span>
        </span>
      )}
    </div>
  );
}

export default function PublicationsDrawer({ publications }) {
  const [isOpen, setIsOpen] = useState(false);

  const getPublicationPoints = (quartile) => {
    const q = String(quartile || "").trim().toUpperCase();
    if (q === "Q1") return 2;
    if (q === "Q2") return 1.6;
    return 0.4;
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const normalizedPublications = useMemo(() => {
    if (!Array.isArray(publications)) return [];
    return publications.map((publication, index) => ({
      ...publication,
      __rowKey: publication?.id || `${publication?.type || "unknown"}-${index}`,
    }));
  }, [publications]);

  const normalizeAuthors = (authors) => {
    if (Array.isArray(authors)) return authors.filter(Boolean).join(", ");
    return authors || "";
  };

  const truncate = (value, maxLength = 70) => {
    if (!value) return "";
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 3)}...`;
  };

  const AuthorsCell = ({ authors }) => {
    const fullAuthors = normalizeAuthors(authors);
    if (!fullAuthors) return <span>-</span>;
    return (
      <span className="relative group inline-flex items-center">
        <span>{truncate(fullAuthors)}</span>
        <span className="absolute bottom-full left-0 z-10 mb-2 hidden w-max max-w-xs rounded border border-gray-200 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-card)] px-2 py-1 text-xs text-gray-700 dark:text-[var(--color-text-secondary)] shadow-lg group-hover:block">
          {fullAuthors}
        </span>
      </span>
    );
  };

  const getPointsValue = (publication, typeKey) => {
    if (publication?.points !== undefined && publication?.points !== null) {
      return publication.points;
    }
    if (typeKey === "journal") return getPublicationPoints(publication?.quartile);
    return 0.4;
  };

  const journalRows = normalizedPublications.filter((publication) => publication.type === "journal");
  const conferenceRows = normalizedPublications.filter((publication) =>
    ["conference_proceedings", "conference"].includes(publication.type)
  );
  const bookRows = normalizedPublications.filter((publication) =>
    ["book", "monograph"].includes(publication.type)
  );
  const conferenceAnnouncementRows = normalizedPublications.filter(
    (publication) => publication.type === "conference_presentation"
  );
  const otherRows = normalizedPublications.filter(
    (publication) => !publication.type || publication.type === "other"
  );

  return (
    <div>
      {/* Drawer Header */}
      <div
        className="flex items-center justify-between px-0 py-4 cursor-pointer bg-patras-[#fffbf6]"
        onClick={toggleDrawer}
      >
        <span className="flex items-center text-patras-buccaneer dark:text-patras-albescentWhite">
          Επιστημονικές δημοσιεύσεις
          <span className="text-patras-buccaneer dark:text-patras-albescentWhite text-lg ml-2">
            {isOpen ? "▼" : "\u25B6\uFE0E"}
          </span>
        </span>
      </div>

      {/* Drawer Content */}
      {isOpen && (
        <div className="overflow-x-auto px-0 pb-4 dark:[&_h3]:text-white dark:[&_table]:bg-[var(--color-bg-card)] dark:[&_table]:border-[var(--color-border)] dark:[&_tbody]:divide-[var(--color-border)] dark:[&_td]:text-[var(--color-text-primary)] dark:[&_td]:border-[var(--color-border)] dark:[&_th]:border-[var(--color-border)]">
          <div className="space-y-6">
            {journalRows.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-patras-buccaneer">
                  Δημοσιεύσεις σε επιστημονικά περιοδικά
                </h3>
                <table className="min-w-full bg-[#fffbf6] border border-patras-cameo rounded-lg shadow-md">
                  <thead className="bg-patras-buccaneer">
                    <tr>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Συγγραφείς
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Έτος
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Τίτλος
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Τίτλος περιοδικού
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        ISSN
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
                    {journalRows.map((publication) => (
                      <tr key={publication.__rowKey}>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          <AuthorsCell authors={publication.authors} />
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.year || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.publicationTitle || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.journalConfTitle || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          <IssnCell issn={publication.issn} />
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.quartile || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle text-[15px]">
                          {getPointsValue(publication, "journal")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {conferenceRows.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-patras-buccaneer">
                  Δημοσιεύσεις σε πρακτικά διεθνών συνεδρίων
                </h3>
                <table className="min-w-full bg-[#fffbf6] border border-patras-cameo rounded-lg shadow-md">
                  <thead className="bg-patras-buccaneer">
                    <tr>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Συγγραφείς
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Έτος
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Τίτλος
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Τίτλος συνεδρίου
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Εκδότης
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider">
                        Μόρια
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-patras-cameo">
                    {conferenceRows.map((publication) => (
                      <tr key={publication.__rowKey}>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          <AuthorsCell authors={publication.authors} />
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.year || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.publicationTitle || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.journalConfTitle || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.publisher || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle text-[15px]">
                          {getPointsValue(publication, "conference")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {bookRows.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-patras-buccaneer">
                  Βιβλία/μονογραφίες
                </h3>
                <table className="min-w-full bg-[#fffbf6] border border-patras-cameo rounded-lg shadow-md">
                  <thead className="bg-patras-buccaneer">
                    <tr>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Συγγραφείς
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Έτος
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Τίτλος
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Εκδότης
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider">
                        Μόρια
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-patras-cameo">
                    {bookRows.map((publication) => (
                      <tr key={publication.__rowKey}>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          <AuthorsCell authors={publication.authors} />
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.year || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.publicationTitle || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.publisher || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle text-[15px]">
                          {getPointsValue(publication, "book")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {conferenceAnnouncementRows.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-patras-buccaneer">
                  Ανακοίνωση σε συνέδριο
                </h3>
                <table className="min-w-full bg-[#fffbf6] border border-patras-cameo rounded-lg shadow-md">
                  <thead className="bg-patras-buccaneer">
                    <tr>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Συγγραφείς
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Έτος
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Τίτλος
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Τίτλος συνεδρίου
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider">
                        Μόρια
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-patras-cameo">
                    {conferenceAnnouncementRows.map((publication) => (
                      <tr key={publication.__rowKey}>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          <AuthorsCell authors={publication.authors} />
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.year || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.publicationTitle || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.journalConfTitle || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle text-[15px]">
                          {getPointsValue(publication, "other_conference")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {otherRows.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-patras-buccaneer">
                  Άλλες δημοσιεύσεις
                </h3>
                <table className="min-w-full bg-[#fffbf6] border border-patras-cameo rounded-lg shadow-md">
                  <thead className="bg-patras-buccaneer">
                    <tr>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Συγγραφείς
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Έτος
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                        Τίτλος
                      </th>
                      <th className="px-4 py-2 text-center text-[15px] font-semibold text-white uppercase tracking-wider">
                        Μόρια
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-patras-cameo">
                    {otherRows.map((publication) => (
                      <tr key={publication.__rowKey}>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          <AuthorsCell authors={publication.authors} />
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.year || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite text-[15px]">
                          {publication.publicationTitle || "-"}
                        </td>
                        <td className="px-4 py-2 text-patras-buccaneer text-center align-middle text-[15px]">
                          {getPointsValue(publication, "other")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
