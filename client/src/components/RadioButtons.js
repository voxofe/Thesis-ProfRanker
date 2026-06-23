import React from "react";

export default function RadioButtons(props) {
    const radioButtonStyle = "h-4 w-4 rounded-full border-gray-300 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-surface)] text-patras-buccaneer dark:text-[var(--color-primary)] dark:checked:bg-[var(--color-primary)] dark:checked:border-[var(--color-primary)] focus:ring-2 focus:ring-patras-buccaneer focus:ring-offset-0";
    const labelStyle = `block text-sm/6 font-medium ${props.disabled ? "text-gray-400 dark:text-[var(--color-text-muted)]" : "text-gray-900 dark:text-[var(--color-text-primary)]"}`;

    return (
        <div>
            <label className={labelStyle}>{props.label}</label>
            <div className="mt-0 sm:mt-4 flex flex-row pb-2 lg:gap-x-9 gap-x-3 justify-start items-center">
                {props.radioButtons.map((option) => (
                    <div key={option.id} className="flex items-center gap-x-1">
                        <input
                            id={option.id}
                            label={props.name}
                            type="radio"
                            className={`${radioButtonStyle} ${props.readOnly ? "cursor-not-allowed" : ""}`}
                            checked={props.value === option.value}
                            disabled={props.disabled}
                            onChange={() => {
                                if (props.readOnly) return;
                                props.onChange(option.value);
                            }}
                            aria-disabled={props.readOnly || props.disabled}
                        />
                        <label
                            htmlFor={option.id}
                            className={`text-sm font-medium ${props.disabled ? "text-gray-400 dark:text-[var(--color-text-muted)]" : "text-gray-800 dark:text-[var(--color-text-secondary)]"}`}
                        >
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}
