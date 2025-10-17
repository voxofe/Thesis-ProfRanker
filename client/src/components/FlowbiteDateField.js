import React, { useEffect, useMemo, useRef } from "react";
import { Datepicker } from "flowbite-react";
import PropTypes from "prop-types";

// --- ISO <-> Date helpers ---
const isoToDate = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const dateToIso = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function FlowbiteDateField({
  label,
  value,
  onChange,
  required = false,
  minDate,
  maxDate,
  popupAlign = "left",
  ...props
}) {
  const wrapperRef = useRef(null); // ✅ FIXED: declare ref

  const dateValue = isoToDate(value);
  const min = minDate ? isoToDate(minDate) : undefined;
  const max = maxDate ? isoToDate(maxDate) : undefined;

  // Clear field (scoped to this component)
  useEffect(() => {
    if (value === "") {
      const input = wrapperRef.current?.querySelector("input[type='text']");
      if (input) input.value = "";
    }
  }, [value]);

  // Popup alignment
  const popupPos = useMemo(() => {
    switch (popupAlign) {
      case "center":
        return "absolute left-1/2 -translate-x-1/2 top-0 -translate-y-full mb-2 z-50 block";
      case "right":
        return "absolute right-0 top-0 -translate-y-full mb-2 z-50 block";
      default:
        return "absolute left-0 top-0 -translate-y-full mb-2 z-50 block";
    }
  }, [popupAlign]);

  // Custom Flowbite theme
  const theme = {
  root: {
    base: "relative dark:bg-patras-albescentWhite-70 dark:text-black",
    input: {
      field: {
        base: "relative w-full",
        input: {
          base: `
            block w-full rounded-md px-3 py-1.5 text-base sm:text-sm/6
            bg-white text-gray-900 placeholder:text-gray-400
            outline outline-1 -outline-offset-1 outline-patras-buccaneer
            focus:outline focus:outline-2 focus:-outline-offset-2
            focus:outline-patras-buccaneer focus:ring-patras-buccaneer
            dark:bg-white dark:text-black
          `,
        },
      },
    },
  },
    popup: {
      root: {
        base: popupPos,
        inline: "relative top-0 z-auto",
        inner:
          "inline-block rounded-lg border border-patras-albescentWhite-50 bg-white p-4 shadow-lg dark:bg-patras-albescentWhite-50 dark:text-black"
      },
      header: {
        base: "",
        title:
          "px-2 py-3 text-center font-semibold text-gray-900 dark:text-white",
        selectors: {
          base: "mb-2 flex justify-between",
          button: {
            base:
              "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 " +
              "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 " +
              "dark:bg-patras-buccaneer dark:text-white dark:hover:bg-patras-sanguineBrown",
            prev: "",
            next: "",
            view: "",
          },
        },
      },
      view: {
        base: "p-1 dark:bg-patras-white dark:text-black",
        button: {
          base: "flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9",
          selected:
            "bg-patras-buccaneer text-white dark:hover:bg-white",
          disabled: "text-gray-400 opacity-60 cursor-not-allowed",
        },
      },
      footer: {
        base: "mt-2 flex space-x-2",
        button: {
          base:
            "w-full rounded-lg px-5 py-2 text-center text-sm font-medium focus:ring-4",
          today:
            "bg-patras-buccaneer text-white hover:bg-patras-sanguineBrown focus:ring-patras-buccaneer/20",
          clear:
            "border border-patras-buccaneer text-patras-buccaneer bg-transparent " +
            "hover:bg-patras-buccaneer hover:text-white " +
            "dark:bg-patras-buccaneer/20 dark:text-patras-buccaneer dark:hover:bg-patras-buccaneer/90 dark:hover:text-white",
        },
      },
    },
    views: {
      days: {
        header: {
          base: "mb-1 grid grid-cols-7",
          title:
            "h-6 text-center text-sm font-medium leading-6 text-gray-500 dark:text-gray-400",
        },
        items: {
          base: "grid w-64 grid-cols-7",
          item: {
            base:
              "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 " +
              "text-gray-900 hover:bg-gray-100 dark:text-black dark:hover:text-white dark:hover:bg-patras-buccaneer/90",
            selected:
              "bg-patras-buccaneer dark:text-white hover:bg-patras-sanguineBrown",
            disabled: "text-gray-400 opacity-60 cursor-not-allowed",
          },
        },
      },
      months: {
        items: {
          base: "grid w-64 grid-cols-4",
          item: {
            base:
              "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 " +
              "text-gray-900 hover:bg-gray-100 dark:text-black dark:hover:text-white dark:hover:bg-patras-buccaneer/90",
            selected:
              "bg-patras-buccaneer dark:text-white hover:bg-patras-sanguineBrown",
            disabled: "text-gray-400 opacity-60 cursor-not-allowed",
          },
        },
      },
      years: {
        items: {
          base: "grid w-64 grid-cols-4",
          item: {
            base:
              "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 " +
              "text-gray-900 hover:bg-gray-100 dark:text-black dark:hover:text-white dark:hover:bg-patras-buccaneer/90",
            selected:
              "bg-patras-buccaneer dark:text-white hover:bg-patras-sanguineBrown",
            disabled: "text-gray-400 opacity-60 cursor-not-allowed",
          },
        },
      },
      decades: {
        items: {
          base: "grid w-64 grid-cols-4",
          item: {
            base:
              "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 " +
              "text-gray-900 hover:bg-gray-100 dark:text-black dark:hover:text-white dark:hover:bg-patras-buccaneer/90",
            selected:
              "bg-patras-buccaneer dark:text-white hover:bg-patras-sanguineBrown",
            disabled: "text-gray-400 opacity-60 cursor-not-allowed",
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col mb-5">
      <label className="block text-sm font-medium pb-2 text-gray-900 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        ref={wrapperRef}
        className="flex items-center gap-3 w-full relative overflow-visible pr-datepicker"
      >
        <div className="relative flex-1">
          <Datepicker
            className="w-full"
            value={dateValue}
            onChange={(dt) => onChange(dt ? dateToIso(dt) : "")}
            minDate={min}
            maxDate={max}
            weekStart={1}
            language="el"
            showTodayButton = {false}
            showClearButton={false}
            labelTodayButton="Σήμερα"
            theme={theme}
            {...props}
          />
        </div>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              title="Καθαρισμός"
              aria-label="Καθαρισμός"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-patras-sanguineBrown hover:text-red-700 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50"
              style={{ zIndex: 10 }}
            >
              <span className="text-2xl leading-none font-bold">&times;</span>
            </button>
          )}
      </div>
    </div>
  );
}

FlowbiteDateField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  popupAlign: PropTypes.oneOf(["left", "center", "right"]),
};