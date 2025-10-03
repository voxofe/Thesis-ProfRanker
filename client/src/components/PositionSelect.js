import React, { useEffect, useMemo, useRef, useState } from "react";

const normalize = (s) =>
  (s ?? "")
    .toLocaleUpperCase("el-GR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0384\u0385\u1fbd\u1fbf-\u1ffe]/g, "");

export default function PositionSelect({
  positions = [],
  value,
  onChange,
  label = "Θέση",
  placeholder = "Αναζήτηστε με σχολή, τμήμα ή επιστημονικό πεδίο...",
  maxResults = 50,
  disabled = false,
  required = false,
  error,
  style = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Match InputField styles
  const baseStyle =
    "block w-full rounded-md px-3 py-1.5 text-base outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:ring-offset-0 sm:text-sm/6";
  const enabledStyle = `${baseStyle} bg-white text-gray-900 outline-patras-buccaneer focus:outline-patras-buccaneer focus:ring-patras-buccaneer`;
  const disabledStyle = `${baseStyle} bg-gray-100 text-gray-500 outline-gray-200 cursor-not-allowed opacity-60 select-none`;
  const errorStyle = "outline-red-500 focus:outline-red-500";
  const getInputStyle = () => {
    if (disabled) return disabledStyle + " pr-12";
    if (error) return `${enabledStyle} ${errorStyle} pr-12`;
    return enabledStyle + " pr-12";
  };

  // Build labels + normalized fields once
  const enriched = useMemo(() => {
    return positions.map((p) => {
      const label = `${p.school} › ${p.department} › ${p.scientificField}`;
      return {
        ...p,
        _label: label,
        _norm: normalize(`${p.school} ${p.department} ${p.scientificField} ${p.id}`),
      };
    });
  }, [positions]);

  // Selected option and shown input value
  const selected = useMemo(
    () => enriched.find((p) => String(p.id) === String(value)) || null,
    [enriched, value]
  );

  const shownText = selected ? selected._label : "";

  // Filtered results
  const results = useMemo(() => {
    const nq = normalize(query);
    if (!nq) return enriched.slice(0, maxResults);
    const filtered = enriched.filter((p) => p._norm.includes(nq));
    return filtered.slice(0, maxResults);
  }, [enriched, query, maxResults]);

  // Keep query in sync with selected
  useEffect(() => {
    // Only update query if input is not focused (avoid fighting the user while typing)
    if (document.activeElement !== inputRef.current) {
      setQuery(shownText);
    }
  }, [shownText]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(e.target)) return; // inside
      setOpen(false);
      setQuery(shownText);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [shownText]);

  const commitSelection = (pos) => {
    onChange?.(String(pos.id));
    setOpen(false);
    setQuery(pos._label);
  };

  const clearSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.("");
    setQuery("");
    setHighlight(0);
    setOpen(true);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pos = results[highlight];
      if (pos) commitSelection(pos);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(shownText);
    }
  };

  const showClear = !disabled && (query?.length > 0 || (value !== undefined && String(value) !== ""));

  return (
    <div className={`${style} mb-5`} ref={wrapperRef}>
      <label
        htmlFor="position-combobox"
        className={[
          "block text-sm/6 font-medium",
          disabled ? "text-gray-400" : "text-gray-900",
          required ? "after:ml-1 after:text-red-500 after:content-['*']" : "",
          style,
        ].join(" ").trim()}
      >
        {label}
      </label>

      <div className="mt-2 relative">
        <input
          id="position-combobox"
          ref={inputRef}
          type="text"
          disabled={disabled}
          required={required}
          aria-required={required}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={getInputStyle()}
        />

        {showClear && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={clearSelection}
            title="Καθαρισμός επιλογής"
            aria-label="Καθαρισμός επιλογής"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-patras-sanguineBrown hover:text-red-700 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50"
          >
            <span className="text-2xl leading-none font-bold">&times;</span>
          </button>
        )}

        {open && (
          <div
            ref={listRef}
            className="absolute z-20 mt-1 w-full max-h-64 overflow-auto bg-white border rounded-md shadow"
          >
            {results.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">Δεν βρέθηκαν αποτελέσματα</div>
            ) : (
              results.map((p, idx) => (
                <button
                  key={`${p.id}-${idx}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commitSelection(p)}
                  className={`w-full text-left px-3 py-2 text-sm ${idx === highlight ? "bg-patras-albescentWhite/60" : "bg-white"} hover:bg-patras-albescentWhite/60`}
                  onMouseEnter={() => setHighlight(idx)}
                  title={p._label}
                >
                  <div className="font-medium text-patras-buccaneer">{p.scientificField}</div>
                  <div className="text-xs text-gray-600">{p.school} • {p.department}</div>
                </button>
              ))
            )}
            <div className="px-3 py-1 text-[11px] text-gray-500 border-t">
              Εμφάνιση {results.length} από {enriched.length}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}