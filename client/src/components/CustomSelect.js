import React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  readOnly = false,
  required = false,
  placeholder = "Επιλέξτε...",
  error,
}) {
  const isDisabled = disabled || readOnly;
  //  Only show placeholder if not disabled
  const selectOptions = !isDisabled
    ? [{ value: "select", label: placeholder }, ...options]
    : [...options];

  // Prevent empty / undefined / null values from breaking Radix
  const safeValue =
    value && value !== "" && value !== undefined ? value : "select";

  // Styles
  const baseStyle =
    "block w-full rounded-md px-3 py-1.5 text-base placeholder:text-gray-400 sm:text-sm/6";
  const enabledStyle = `${baseStyle} bg-white text-gray-900 outline outline-1 outline-patras-buccaneer -outline-offset-1 focus:outline-2 focus:outline-patras-buccaneer focus:-outline-offset-2 dark:bg-[var(--color-bg-surface)] dark:text-[var(--color-text-primary)] dark:placeholder:text-[var(--color-text-muted)] dark:outline-[var(--color-border)] dark:focus:outline-[var(--color-primary)]`;
  const disabledStyle = `${baseStyle} bg-gray-100 text-gray-500 outline outline-gray-200 cursor-not-allowed opacity-60 select-none dark:bg-[var(--color-bg-muted)] dark:text-[var(--color-text-muted)] dark:outline-[var(--color-border-soft)]`;
  const errorStyle = "outline-red-500 focus:outline-red-500";

  const newFieldStyle =
    "font-semibold bg-patras-albescentWhite/50 border border-patras-cameo text-gray-900 dark:text-gray-900";

  const getTriggerStyle = () => {
    if (disabled) return disabledStyle;
    if (readOnly) return `${enabledStyle} cursor-not-allowed`;
    return enabledStyle;
  };

  return (
    <div className="mb-5 relative overflow-visible">
      {label && (
        <label
          className={`block text-sm/6 font-medium ${
            disabled ? "text-gray-400 dark:text-[var(--color-text-muted)]" : "text-gray-900 dark:text-[var(--color-text-primary)]"
          }`}
        >
          {label}
          {required && !isDisabled && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <Select.Root
        value={safeValue}
        onValueChange={(v) => {
          if (!isDisabled) onChange(v);
        }}
        disabled={isDisabled}
      >
        <Select.Trigger
          className={`mt-2 ${getTriggerStyle()} flex justify-between items-center w-full text-left ring-0 focus:ring-0 whitespace-nowrap overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-patras-buccaneer dark:focus-visible:ring-[var(--color-primary)]`}
          title={
            safeValue === "select"
              ? placeholder
              : options.find((optn) => optn.value === safeValue)?.label || placeholder
          }
        >
          <Select.Value asChild>
            <span className="flex-1 min-w-0 overflow-hidden whitespace-nowrap truncate pr-2">
              {safeValue === "select"
                ? placeholder // 👈 Always show placeholder text visually
                : options.find((optn) => optn.value === safeValue)?.label || placeholder}
            </span>
          </Select.Value>
          <Select.Icon>
            <ChevronDown className="w-4 h-4 opacity-70" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
              className="z-50 w-[--radix-select-trigger-width] min-w-[--radix-select-trigger-width] bg-white border border-patras-buccaneer/20 rounded-md shadow-lg overflow-hidden dark:bg-[var(--color-bg-card)] dark:border-[var(--color-border)]"
              position="popper"
              sideOffset={5}
              align="end"
            >
            <Select.Viewport
              style={{
                maxHeight: 300,
                overflowY: "auto",
                scrollbarGutter: "stable",
              }}
              className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-[var(--color-border)] dark:scrollbar-track-[var(--color-bg-surface)]"
            >
              {selectOptions.length > 0 ? (
                selectOptions.map((optn) => (
                  <Select.Item
                    key={optn.value}
                    value={optn.value}
                    className={`cursor-pointer px-3 py-1.5 text-base text-gray-900 hover:bg-patras-buccaneer/90 hover:text-white focus:bg-patras-buccaneer/90 focus:text-white dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-primary)] dark:hover:text-[var(--color-text-inverse)] dark:focus:bg-[var(--color-primary)] dark:focus:text-[var(--color-text-inverse)] flex items-center justify-between sm:text-sm/6 ${
                      optn.value === "__new__" ? newFieldStyle : ""
                    }`}
                    title={optn.label}
                  >
                    <Select.ItemText className="whitespace-nowrap">{optn.label}</Select.ItemText>
                  </Select.Item>
                ))
              ) : (
                <div className="px-3 py-1.5 text-gray-400 text-base select-none sm:text-sm/6 dark:text-[var(--color-text-muted)]">
                  Δεν υπάρχουν επιλογές
                </div>
              )}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {error && <p className="mt-1 text-sm text-red-600 dark:text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
