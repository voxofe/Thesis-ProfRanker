import React, { useMemo, useState } from "react";

export const formatDateTimeCell = (dateValue, timeValue, fallbackTime = "00:00") => {
  if (!dateValue) return "—";

  const pad2 = (v) => String(v).padStart(2, "0");

  const renderDateTime = (datePart, timePart) => (
    <span className="inline-flex flex-col leading-tight">
      <span>{datePart}</span>
      <span className="text-xs text-gray-600">{timePart}</span>
    </span>
  );

  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    const dd = pad2(dateValue.getDate());
    const mm = pad2(dateValue.getMonth() + 1);
    const yyyy = dateValue.getFullYear();
    const embedded = `${pad2(dateValue.getHours())}:${pad2(dateValue.getMinutes())}`;
    const time = timeValue || embedded || fallbackTime;
    const [hh, min] = String(time).split(":");
    return renderDateTime(`${dd}-${mm}-${yyyy}`, `${pad2(hh || 0)}:${pad2(min || 0)}`);
  }

  const raw = String(dateValue);
  const embeddedTime = raw.match(/\b(\d{2}:\d{2})\b/)?.[1];
  const time = timeValue || embeddedTime || fallbackTime;
  const [hh, min] = String(time).split(":");
  const paddedTime = `${pad2(hh || 0)}:${pad2(min || 0)}`;

  const datePart = raw.includes("T")
    ? raw.split("T")[0]
    : raw.includes(" ")
      ? raw.split(" ")[0]
      : raw;

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split("-");
    return renderDateTime(`${d}-${m}-${y}`, paddedTime);
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) {
    return renderDateTime(datePart, paddedTime);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
    const [d, m, y] = datePart.split("/");
    return renderDateTime(`${d}-${m}-${y}`, paddedTime);
  }

  return renderDateTime(datePart, paddedTime);
};

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
  tableClassName = "min-w-full table-fixed text-[13px] font-medium bg-white/25 t-5",
  theadClassName = "bg-patras-buccaneer",
  tbodyClassName = "divide-y divide-patras-cameo text-[13px]",
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
