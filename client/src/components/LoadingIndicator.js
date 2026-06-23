import React from "react";

const sizeClassMap = {
  sm: "h-5 w-5 border-b-2",
  md: "h-8 w-8 border-b-2",
  lg: "h-10 w-10 border-b-[3px]",
};

export default function LoadingIndicator({
  text = "Φόρτωση...",
  showText = true,
  size = "md",
  textClassName = "mt-4 text-gray-600 dark:text-[var(--color-text-primary)]",
  className = "",
}) {
  const sizeClasses = sizeClassMap[size] || sizeClassMap.md;

  return (
    <div role="status" aria-live="polite" className={`text-center ${className}`.trim()}>
      <div
        className={`inline-block animate-spin rounded-full border-patras-buccaneer dark:border-[var(--color-text-primary)] ${sizeClasses}`}
        aria-hidden="true"
      ></div>
      {showText && <p className={textClassName}>{text}</p>}
      <span className="sr-only">{text}</span>
    </div>
  );
}