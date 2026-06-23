import React, { useEffect, useRef, useState } from "react";

export default function PhdAbstractField({
  value,
  onChange,
  readOnly = false,
  minWords = 0,
  maxWords = Infinity,
  label = "Περίληψη διδακτορικής διατριβής",
  placeholder = "",
  required = false,
  id = "phd-abstract",
  name = "phd-abstract",
}) {
  const textareaRef = useRef(null);
  const [minHeight, setMinHeight] = useState(0);
  const safeValue = value || "";
  const trimmedValue = safeValue.trim();
  const wordCount = trimmedValue
    ? trimmedValue.split(/\s+/).filter(Boolean).length
    : 0;
  const tooShort = wordCount > 0 && wordCount < minWords;
  const tooLong = wordCount > maxWords;

  useEffect(() => {
    if (!textareaRef.current) return;
    if (!minHeight) {
      setMinHeight(textareaRef.current.scrollHeight);
    }
  }, [minHeight]);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    const nextHeight = Math.max(element.scrollHeight, minHeight || element.scrollHeight);
    element.style.height = `${nextHeight}px`;
  }, [safeValue, minHeight]);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm/6 font-medium text-gray-900 dark:text-[var(--color-text-primary)]"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-2">
        <textarea
          id={id}
          name={name}
          rows={12}
          value={safeValue}
          onChange={(event) => onChange(event.target.value)}
          ref={textareaRef}
          className={`block w-full rounded-md px-3 py-2 text-sm text-gray-900 dark:text-[var(--color-text-primary)] outline outline-1 -outline-offset-1 placeholder:text-gray-400 dark:text-[var(--color-text-muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-patras-buccaneer focus:ring-offset-0 focus:ring-patras-buccaneer ${
            tooShort ? "outline-red-500 focus:outline-red-500" : ""
          }`}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-[var(--color-text-muted)]">{wordCount} λέξεις</p>
      {tooShort && (
        <p className="mt-1 text-xs text-red-600">
          Ελάχιστο {minWords} λέξεις.
        </p>
      )}
      {tooLong && (
        <p className="mt-1 text-xs text-red-600">
          Μέγιστο {maxWords} λέξεις.
        </p>
      )}
    </div>
  );
}
