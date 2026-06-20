import React from "react";

/**
 * Reusable collapsible notice/panel component with arrow toggle.
 * Starts closed by default. Used for verification notices, action prompts, etc.
 *
 * @param {string} mainText - Main message text
 * @param {React.ReactNode} children - Content (buttons, etc.) shown when expanded
 * @param {boolean} isOpen - Whether the panel is expanded
 * @param {function} onToggle - Callback when arrow is clicked
 * @param {string} [headlineClassName] - Custom class for headline
 * @param {string} [containerClassName] - Custom class for outer container
 */
export default function CollapsibleNotice({
  mainText,
  children,
  isOpen,
  onToggle,
  headlineClassName = "text-sm text-center text-patras-buccaneer",
  containerClassName = "mb-6 mx-auto w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3",
}) {
  return (
    <div className={containerClassName}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 text-patras-buccaneer"
      >
        <span className={`${headlineClassName} whitespace-pre-wrap`}>{mainText}</span>
        <span className="text-lg shrink-0">{isOpen ? "▼" : "\u25B6\uFE0E"}</span>
      </button>
      {isOpen && <div className="mt-3 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}
