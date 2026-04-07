import React, { useMemo, useState } from "react";

export default function SortableTable({
  columns,
  rows,
  renderRow,
  getRowKey,
  getSortedRows,
  initialSortBy,
  initialSortDirection = "asc",
  loading = false,
  loadingMessage = "Φόρτωση...",
  emptyMessage = "Δεν υπάρχουν διαθέσιμες εγγραφές.",
  wrapperClassName = "w-full overflow-x-auto overflow-y-visible shadow-md rounded-lg border border-patras-capePalliser/50",
  tableClassName = "min-w-full table-fixed font-semibold bg-white/25 t-5",
  theadClassName = "bg-patras-buccaneer",
  tbodyClassName = "divide-y divide-patras-cameo",
  headerCellClassName = "",
}) {
  const [sortBy, setSortBy] = useState(initialSortBy || columns[0]?.key);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const renderSortArrow = (key) => {
    if (sortBy !== key) return null;
    return sortDirection === "asc" ? (
      <span className="ml-2 text-base text-white align-middle">{"\u25B2"}</span>
    ) : (
      <span className="ml-2 text-base text-white align-middle">{"\u25BC"}</span>
    );
  };

  const sortedRows = useMemo(() => {
    if (typeof getSortedRows === "function") {
      return getSortedRows(rows, sortBy, sortDirection);
    }
    const safeRows = Array.isArray(rows) ? rows : [];
    return [...safeRows].sort((a, b) => {
      const valA = a?.[sortBy]?.toString().toLowerCase() || "";
      const valB = b?.[sortBy]?.toString().toLowerCase() || "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortBy, sortDirection, getSortedRows]);

  const resolveHeaderClass = (col) => {
    if (typeof headerCellClassName === "function") {
      return headerCellClassName(col);
    }
    return headerCellClassName;
  };

  return (
    <div className={wrapperClassName}>
      <table className={tableClassName}>
        <thead className={theadClassName}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={resolveHeaderClass(col)}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {renderSortArrow(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={tbodyClassName}>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-400 py-8">
                {loadingMessage}
              </td>
            </tr>
          ) : sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-400 py-8">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedRows.map((row, index) => {
              const key = getRowKey ? getRowKey(row, index) : row?.id ?? index;
              return renderRow(row, key, index);
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
