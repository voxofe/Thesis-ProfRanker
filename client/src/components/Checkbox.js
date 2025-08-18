import React from "react";

export default function Checkbox(props) {
  const checkboxStyle =
    "h-4 w-4 rounded border-gray-300 text-patras-buccaneer focus:ring-2 focus:ring-patras-buccaneer focus:ring-offset-0";

  const labelStyle = "block text-sm/6 font-medium text-gray-900";
  const descriptionStyle = "text-sm/6 text-gray-500";

  return (
    <div className={props.className}>
      <div className="flex items-center">
        <input
          id={props.id}
          name={props.name}
          type="checkbox"
          className={checkboxStyle}
          checked={props.checked}
          onChange={(e) => props.onChange(e.target.checked)}
        />
        <label htmlFor={props.id} className={`ml-3 ${labelStyle}`}>
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      <p id={`${props.id}-description`} className={`mt-1 ${descriptionStyle}`}>
        {props.description}
      </p>
    </div>
  );
}
