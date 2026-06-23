import React from "react";

export default function PageTitle({ children, className = "" }) {
  return (
    <h1
      className={`text-2xl text-center border-b border-gray-300 dark:border-gray-500 pb-2 text-gray-800 dark:text-[var(--color-text-primary)] ${className}`.trim()}
    >
      {children}
    </h1>
  );
}
