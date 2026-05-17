import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
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

const isoToDisplay = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}-${m}-${y}`;
};

const displayToIso = (display) => {
  if (!display) return "";
  const parts = display
    .trim()
    .split(/[-./\s]/)
    .filter(Boolean);
  if (parts.length !== 3) return "";

  const [dStr, mStr, yStr] = parts;
  const day = Number(dStr);
  const month = Number(mStr);
  const year = Number(yStr);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return "";
  }
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return "";
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }

  return dateToIso(date);
};

const formatDisplayInput = (raw, options = {}) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";

  let idx = 0;
  let day = "";
  let month = "";
  let dayAuto = false;
  let monthAuto = false;
  let dayComplete = false;
  let monthComplete = false;

  // Smart-advance: if first day digit is 4-9, treat as 0d and move on.
  const d1 = digits[idx];
  if (d1 >= "4") {
    day = `0${d1}`;
    dayAuto = true;
    dayComplete = true;
    idx += 1;
  } else if (d1 === "3") {
    if (digits.length - idx >= 2) {
      const d2 = digits[idx + 1];
      if (d2 === "0" || d2 === "1") {
        day = `3${d2}`;
        dayComplete = true;
        idx += 2;
      } else {
        day = "03";
        dayAuto = true;
        dayComplete = true;
        idx += 1;
      }
    } else {
      day = digits.slice(idx);
      idx = digits.length;
    }
  } else if (digits.length - idx >= 2) {
    day = digits.slice(idx, idx + 2);
    dayComplete = true;
    idx += 2;
  } else {
    day = digits.slice(idx);
    idx = digits.length;
  }

  if (idx < digits.length) {
    // Smart-advance: if first month digit is 2-9, treat as 0m and move on.
    const m1 = digits[idx];
    if (m1 >= "2") {
      month = `0${m1}`;
      monthAuto = true;
      monthComplete = true;
      idx += 1;
    } else if (m1 === "1" && digits.length - idx >= 2) {
      const m2 = digits[idx + 1];
      if (m2 >= "3") {
        month = "01";
        monthAuto = true;
        monthComplete = true;
        idx += 1;
      } else {
        month = `1${m2}`;
        monthComplete = true;
        idx += 2;
      }
    } else if (digits.length - idx >= 2) {
      month = digits.slice(idx, idx + 2);
      monthComplete = true;
      idx += 2;
    } else {
      month = digits.slice(idx);
      idx = digits.length;
    }
  }

  const year = digits.slice(idx, idx + 4);
  const parts = [];
  if (day) parts.push(day);
  if (month) parts.push(month);
  if (year) parts.push(year);

  let output = parts.join("-");
  if (dayComplete && !month) output += "-";
  if (monthComplete && !year && month) output += "-";
  if (options.suppressTrailingDash && output.endsWith("-")) {
    output = output.slice(0, -1);
  }
  return output;
};

const isoToLongDisplay = (iso) => {
  if (!iso) return "";
  const date = isoToDate(iso);
  if (!date) return "";
  return new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const isWithinRange = (iso, minDate, maxDate) => {
  if (!iso) return false;
  const current = isoToDate(iso);
  if (!current) return false;
  if (minDate) {
    const min = isoToDate(minDate);
    if (min && current < min) return false;
  }
  if (maxDate) {
    const max = isoToDate(maxDate);
    if (max && current > max) return false;
  }
  return true;
};

export default function FlowbiteDateField({
  label,
  value,
  onChange,
  onClear,
  required = false,
  minDate,
  maxDate,
  popupAlign = "left",
  usePortal = false,
  placeholder = "DD-MM-YYYY",
  readOnly = false,
  ...props
}) {
  const { className: inputClassNameProp, ...inputProps } = props;
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const popupRef = useRef(null);
  const isClearingRef = useRef(false);
  const suppressTrailingDashRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [popupStyle, setPopupStyle] = useState({});
  const [popupReady, setPopupReady] = useState(false);

  const dateValue = isoToDate(value);
  const min = minDate ? isoToDate(minDate) : undefined;
  const max = maxDate ? isoToDate(maxDate) : undefined;

  const commitTextValue = useCallback(
    (rawValue) => {
      const raw = rawValue.trim();
      if (!raw) {
        onChange("");
        onClear?.();
        return "";
      }

      const nextIso = displayToIso(raw);
      if (nextIso && isWithinRange(nextIso, minDate, maxDate)) {
        onChange(nextIso);
        return nextIso;
      }

      return null;
    },
    [onChange, onClear, minDate, maxDate]
  );

  useEffect(() => {
    if (isFocused) return;
    setInputValue(value ? isoToLongDisplay(value) : "");
  }, [value, isFocused]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target)) return;

      if (isFocused) {
        const committed = commitTextValue(inputValue) ?? value;
        setInputValue(committed ? isoToLongDisplay(committed) : "");
        setIsFocused(false);
      }
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [commitTextValue, inputValue, isFocused, value]);

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

  const updatePopupPosition = useCallback(() => {
    if (!popupRef.current || !inputRef.current) return;

    const inputRect = inputRef.current.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();

    let left = inputRect.left;
    if (popupAlign === "center") {
      left = inputRect.left + (inputRect.width - popupRect.width) / 2;
    }
    if (popupAlign === "right") {
      left = inputRect.right - popupRect.width;
    }

    let top = inputRect.top - popupRect.height - 8;
    if (top < 8) {
      top = inputRect.bottom + 8;
    }

    setPopupStyle({
      position: "fixed",
      top: Math.max(8, top),
      left: Math.max(8, left),
      zIndex: 60,
      visibility: "visible",
    });
    setPopupReady(true);
  }, [popupAlign]);

  useLayoutEffect(() => {
    if (!usePortal || !isOpen) return;
    setPopupReady(false);

    const rafId = requestAnimationFrame(updatePopupPosition);
    const handleUpdate = () => updatePopupPosition();

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isOpen, updatePopupPosition, usePortal]);

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

  const inputClassName = inputClassNameProp
    ? `${theme.root.input.field.input.base} ${inputClassNameProp}`
    : theme.root.input.field.input.base;


  const inlineTheme = useMemo(
    () => ({
      ...theme,
      popup: {
        ...theme.popup,
        root: {
          ...theme.popup.root,
          base: "relative top-0 z-auto",
          inline: "",
        },
      },
    }),
    [theme]
  );

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
          <input
            type="text"
            value={inputValue}
            placeholder={placeholder}
            inputMode="numeric"
            pattern="\d{2}-\d{2}-\d{4}"
            {...inputProps}
            ref={inputRef}
            onFocus={() => {
              if (readOnly) return;
              setIsFocused(true);
              if (isClearingRef.current) {
                isClearingRef.current = false;
                setInputValue("");
              } else {
                setInputValue(value ? isoToDisplay(value) : "");
              }
              setIsOpen(true);
            }}
            onBlur={(event) => {
              if (readOnly) return;
              const nextTarget = event.relatedTarget;
              if (nextTarget && wrapperRef.current?.contains(nextTarget)) {
                return;
              }

              if (isFocused) {
                const committed = commitTextValue(inputValue) ?? value;
                setInputValue(committed ? isoToLongDisplay(committed) : "");
                setIsFocused(false);
              }
              setIsOpen(false);
            }}
            onChange={(event) => {
              if (readOnly) return;
              setInputValue(
                formatDisplayInput(event.target.value, {
                  suppressTrailingDash: suppressTrailingDashRef.current,
                })
              );
              suppressTrailingDashRef.current = false;
            }}
            onKeyDown={(event) => {
              if (readOnly) return;
              if (event.key === "Backspace") {
                const el = inputRef.current;
                if (
                  el &&
                  inputValue.endsWith("-") &&
                  el.selectionStart === inputValue.length &&
                  el.selectionEnd === inputValue.length
                ) {
                  suppressTrailingDashRef.current = true;
                }
              }
              if (event.key === "Enter") {
                event.preventDefault();
                const committed = commitTextValue(inputValue) ?? value;
                setInputValue(committed ? isoToLongDisplay(committed) : "");
                setIsFocused(false);
                setIsOpen(false);
                inputRef.current?.blur();
              }
            }}
            readOnly={readOnly}
            className={inputClassName}
          />
        </div>

        {isOpen && !usePortal && !readOnly && (
          <div className={popupPos}>
            <Datepicker
              inline
              value={dateValue}
              onChange={(dt) => {
                const nextIso = dt ? dateToIso(dt) : "";
                if (nextIso && !isWithinRange(nextIso, minDate, maxDate)) {
                  return;
                }
                onChange(nextIso);
                setInputValue(nextIso ? isoToLongDisplay(nextIso) : "");
                setIsFocused(false);
                setIsOpen(false);
              }}
              minDate={min}
              maxDate={max}
              weekStart={1}
              language="el"
              showTodayButton={false}
              showClearButton={false}
              labelTodayButton="Σήμερα"
              theme={inlineTheme}
            />
          </div>
        )}

        {isOpen && usePortal && !readOnly &&
          createPortal(
            <div
              ref={popupRef}
              style={popupReady ? popupStyle : { position: "fixed", top: 0, left: 0, visibility: "hidden", zIndex: 60 }}
              className="z-50"
            >
              <Datepicker
                inline
                value={dateValue}
                onChange={(dt) => {
                  const nextIso = dt ? dateToIso(dt) : "";
                  if (nextIso && !isWithinRange(nextIso, minDate, maxDate)) {
                    return;
                  }
                  onChange(nextIso);
                  setInputValue(nextIso ? isoToLongDisplay(nextIso) : "");
                  setIsFocused(false);
                  setIsOpen(false);
                }}
                minDate={min}
                maxDate={max}
                weekStart={1}
                language="el"
                showTodayButton={false}
                showClearButton={false}
                labelTodayButton="Σήμερα"
                theme={inlineTheme}
              />
            </div>,
            document.body
          )}

          {value && !readOnly && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                isClearingRef.current = true;
                onChange("");
                onClear?.();
                setInputValue("");
                setIsFocused(true);
                setIsOpen(true);
                inputRef.current?.focus();
              }}
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
  onClear: PropTypes.func,
  required: PropTypes.bool,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  popupAlign: PropTypes.oneOf(["left", "center", "right"]),
  usePortal: PropTypes.bool,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
};