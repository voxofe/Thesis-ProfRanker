import React from "react";

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
 * @returns {JSX.Element} The rendered input field or dropdown.
 */
export default function InputField(props) {
  const baseStyle =
    "block w-full rounded-md px-3 py-1.5 text-base outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:ring-offset-0 sm:text-sm/6";

  const enabledStyle = `${baseStyle} bg-white text-gray-900 outline-patras-buccaneer focus:outline-patras-buccaneer focus:ring-patras-buccaneer`;

  const disabledStyle = `${baseStyle} bg-gray-100 text-gray-500 outline-gray-200 cursor-not-allowed opacity-60 select-none`;

  const errorStyle = "outline-red-500 focus:outline-red-500";

  const getInputStyle = () => {
    if (props.disabled) return disabledStyle;
    if (props.error) return `${enabledStyle} ${errorStyle}`;
    return enabledStyle;
  };

  return (
    <div className={`${props.style} mb-5`}>
      <label
        htmlFor={props.id}
        className={`block text-sm/6 font-medium ${
          props.disabled ? "text-gray-400" : "text-gray-900"
        } ${props.style}`}
      >
        {props.label}
        {props.required && !props.disabled && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      <div className="mt-2">
        {props.isDropdown ? (
          <select
            id={props.id}
            name={props.name}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            disabled={props.disabled}
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
            type={props.type}
            autoComplete={props.autoComplete}
            min={props.min}
            max={props.max}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            disabled={props.disabled}
            className={getInputStyle()}
          />
        )}
      </div>
      {props.error && (
        <p className="mt-1 text-sm text-red-600">{props.error}</p>
      )}
    </div>
  );
}
