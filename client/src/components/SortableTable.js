import React, { useEffect, useMemo, useState } from "react";

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
  enableSearch = true,
  searchableColumns,
  searchPlaceholder = "Αναζήτηση...",
  searchDebounceMs = 300,
  searchText: controlledSearchText,
  onSearchTextChange,
  showSearchBar = true,
  loading = false,
  loadingMessage = "Φόρτωση...",
  emptyMessage = "Δεν υπάρχουν διαθέσιμες εγγραφές.",
  wrapperClassName = "w-full overflow-x-auto overflow-y-visible shadow-md rounded-lg border border-patras-capePalliser/50",
  tableClassName = "min-w-full table-fixed text-[13px] font-medium bg-white/25 t-5",
  theadClassName = "bg-patras-buccaneer",
  tbodyClassName = "divide-y divide-patras-cameo text-[13px]",
  headerCellClassName = "",
  showEntriesCount = true,
  formatEntriesCount,
}) {
  const [sortBy, setSortBy] = useState(initialSortBy || columns[0]?.key);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const isSearchControlled = typeof controlledSearchText === "string";
  const resolvedSearchText = isSearchControlled ? controlledSearchText : searchText;
  const handleSearchTextChange = onSearchTextChange || setSearchText;

  useEffect(() => {
    if (!enableSearch) return undefined;
    const handle = setTimeout(() => {
      setDebouncedSearchText(resolvedSearchText.trim());
    }, searchDebounceMs);
    return () => clearTimeout(handle);
  }, [resolvedSearchText, searchDebounceMs, enableSearch]);

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

  const searchableKeys = useMemo(() => {
    if (Array.isArray(searchableColumns) && searchableColumns.length > 0) {
      return searchableColumns;
    }
    return (columns || []).map((col) => col?.key).filter(Boolean);
  }, [columns, searchableColumns]);


  const normalizeSearchValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString();
    }
    return String(value);
  };

  const normalizeForSearch = (value) => {
    return normalizeSearchValue(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const buildSearchValues = (row) => {
    const values = searchableKeys
      .map((key) => normalizeForSearch(row?.[key]))
      .filter(Boolean);

    const firstName = row?.firstName ?? "";
    const lastName = row?.lastName ?? "";
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      values.push(normalizeForSearch(fullName));
    }

    return values;
  };


  const filteredRows = useMemo(() => {
    const safeRows = Array.isArray(rows) ? rows : [];
    if (!enableSearch) return safeRows;
    const normalizedQuery = normalizeForSearch(debouncedSearchText);
    if (!normalizedQuery) return safeRows;
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return safeRows.filter((row) => {
      const values = buildSearchValues(row);
      if (!values.length) return false;
      return queryTokens.every((token) => values.some((value) => value.includes(token)));
    });
  }, [rows, debouncedSearchText, searchableKeys, enableSearch]);

  const totalRows = Array.isArray(rows) ? rows.length : 0;
  const visibleRows = filteredRows.length;

  const sortedRows = useMemo(() => {
    if (typeof getSortedRows === "function") {
      return getSortedRows(filteredRows, sortBy, sortDirection);
    }
    return [...filteredRows].sort((a, b) => {
      const valA = a?.[sortBy]?.toString().toLowerCase() || "";
      const valB = b?.[sortBy]?.toString().toLowerCase() || "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortBy, sortDirection, getSortedRows]);

  const resolveHeaderClass = (col) => {
    if (typeof headerCellClassName === "function") {
      return headerCellClassName(col);
    }
    return headerCellClassName;
  };

  const entriesCountLabel =
    typeof formatEntriesCount === "function"
      ? formatEntriesCount({ visibleRows, totalRows })
      : `Εμφάνιση: ${visibleRows} από ${totalRows}`;

  return (
    <div className="w-full">
      {(enableSearch && showSearchBar) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
              </svg>
            </span>
            <input
              type="text"
              value={resolvedSearchText}
              onChange={(event) => handleSearchTextChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-patras-capePalliser/50 bg-white/90 py-1.5 pl-9 pr-3 text-sm text-gray-800 shadow-sm focus:border-patras-buccaneer focus:outline-none"
            />
            {resolvedSearchText && (
              <button
                type="button"
                onClick={() => handleSearchTextChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/5 text-red-700 hover:bg-red-500/10 hover:text-red-800"
                aria-label="Καθαρισμός αναζήτησης"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      <div className={wrapperClassName}>
        {showEntriesCount && !loading && (
          <div className="flex items-center justify-end border-b border-patras-capePalliser/40 bg-white/70 px-4 py-1 text-[13px] font-medium text-gray-500">
            {entriesCountLabel}
          </div>
        )}
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
    </div>
  );
}
