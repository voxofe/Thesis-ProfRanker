import React from "react";

export default function Checkbox(props) {
  const checkboxStyle =
    "h-4 w-4 rounded border-gray-300 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-surface)] text-patras-buccaneer dark:text-[var(--color-primary)] dark:checked:bg-[var(--color-primary)] dark:checked:border-[var(--color-primary)] focus:ring-2 focus:ring-patras-buccaneer focus:ring-offset-0";

  const labelStyle = "block text-sm/6 font-medium text-gray-900 dark:text-[var(--color-text-primary)]";
  const descriptionStyle = "text-sm/6 text-gray-500 dark:text-[var(--color-text-muted)]";

  return (
    <div className={props.className}>
      <div className="flex items-center">
        <input
          id={props.id}
          name={props.name}
          type="checkbox"
          className={`${checkboxStyle} ${props.readOnly ? "cursor-not-allowed" : ""}`}
          checked={props.checked}
          onChange={(e) => {
            if (props.readOnly) return;
            props.onChange(e.target.checked);
          }}
          disabled={props.disabled}
          aria-disabled={props.readOnly || props.disabled}
        />
        <label
          htmlFor={props.id}
          className={`ml-3 ${labelStyle} ${props.labelClassName || ""}`}
        >
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
