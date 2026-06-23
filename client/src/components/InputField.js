import React, { useState } from "react";

/**
 * InputField component for rendering input fields or dropdowns.
 * @param {Object} props - The properties for the input field.
 * @param {boolean} [props.disabled=false] - Whether the input is disabled.
 * @param {string} props.id - The ID for the input field.
 * @param {string} props.name - The name for the input field.
 * @param {string} props.type - The type of the input field (e.g., "text", "number").
 * @param {string} props.autoComplete - The autocomplete attribute for the input field.
 * @param {string} props.label - The label for the input field.
 * @param {string} props.value - The current value of the input field.
 * @param {function} props.onChange - The function to call when the input value changes.
 * @param {Array} [props.optns] - The options for the dropdown (if applicable).
 * @param {boolean} [props.isDropdown=false] - Whether the input is a dropdown.
 * @param {string} [props.style] - Additional styles to apply to the input field.
 * @param {string} [props.min] - The minimum value for number inputs.
 * @param {string} [props.max] - The maximum value for number inputs.
 * @param {function} [props.onBlur] - The function to call when the input loses focus.
 * @param {boolean} [props.required=false] - Whether the field is required.
 * @param {string} [props.error] - Error message to display.
 * @param {string} [props.inputTitle] - Optional title attribute for the input.
 * @returns {JSX.Element} The rendered input field or dropdown.
 */
export default function InputField(props) {
  const [showPassword, setShowPassword] = useState(false);
  const baseStyle =
    "block w-full rounded-md px-3 py-1.5 text-base outline outline-1 -outline-offset-1 placeholder:text-gray-400 dark:placeholder:text-[var(--color-text-muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:ring-offset-0 sm:text-sm/6";

  const enabledStyle = `${baseStyle} bg-white text-gray-900 outline-patras-buccaneer focus:outline-patras-buccaneer focus:ring-patras-buccaneer dark:bg-[var(--color-bg-card)] dark:text-[var(--color-text-primary)] dark:outline-[var(--color-border-accent)] dark:focus:outline-[var(--color-primary)] dark:focus:ring-[var(--color-primary)]`;

  const disabledStyle = `${baseStyle} bg-gray-100 text-gray-500 outline-gray-200 cursor-not-allowed opacity-60 select-none dark:bg-[var(--color-disabled-bg)] dark:text-[var(--color-disabled-text)] dark:outline-[var(--color-border)]`;

  const errorStyle = "outline-red-500 focus:outline-red-500";

  const getInputStyle = () => {
    if (props.disabled) return disabledStyle;
    if (props.readOnly) return `${enabledStyle} cursor-not-allowed`;
    return enabledStyle;
  };

  const isPassword = props.type === "password";
  const inputType = isPassword && showPassword ? "text" : props.type;

  return (
    <div className={`${props.style} mb-5 relative overflow-visible`}>
      <label
        htmlFor={props.id}
        className={`block text-sm/6 font-medium ${
          props.disabled
            ? "text-gray-400 dark:text-[var(--color-text-muted)]"
            : "text-gray-900 dark:text-[var(--color-text-primary)]"
        } ${props.style}`}
      >
        {props.label}
        {props.required && !props.disabled && (
          <span className="text-red-500 dark:text-red-400 ml-1">*</span>
        )}
      </label>
      <div className="mt-2 relative">
        {props.isDropdown ? (
          <select
            id={props.id}
            name={props.name}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            disabled={props.disabled}
            title={props.inputTitle}
            className={getInputStyle()}
          >
            <option value="">Επιλέξτε...</option>
            {props.optns.map((optn, index) => (
              <option key={index} value={optn.value}>
                {optn.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            onBlur={props.onBlur}
            id={props.id}
            name={props.name}
            type={inputType}
            autoComplete={props.autoComplete}
            min={props.min}
            max={props.max}
            value={props.value}
            onChange={(e) => {
              if (props.readOnly) return;
              props.onChange(e.target.value);
            }}
            disabled={props.disabled}
            readOnly={props.readOnly}
            title={props.inputTitle}
            className={`${getInputStyle()} ${isPassword ? "pr-10" : ""}`}
          />
        )}
        {isPassword && !props.disabled && !props.isDropdown && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-patras-buccaneer dark:text-[var(--color-text-muted)] dark:hover:text-[var(--color-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patras-buccaneer dark:focus-visible:outline-[var(--color-primary)]"
            aria-label={showPassword ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94" />
                <path d="M1 1l22 22" />
                <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
                <path d="M14.12 14.12A3 3 0 0 0 12 9a3 3 0 0 0-2.12.88" />
                <path d="M8.46 6.46A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-2.67 4.14" />
              </svg>
            )}
          </button>
        )}
      </div>
      {props.error && (
        <p className="mt-1 text-sm text-red-600 dark:text-[var(--color-danger)]">{props.error}</p>
      )}
    </div>
  );
}
