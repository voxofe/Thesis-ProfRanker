import React, { useEffect, useRef } from "react";

export const COURSE_SCHEDULE_WEEK_FIELDS = Array.from({ length: 13 }, (_, index) => {
  const week = index + 1;
  return {
    key: `courseScheduleWeek${week}`,
    label: `Προγραμματισμός μαθημάτων - Διδακτέα ύλη (Εβδομάδα ${week})`,
    placeholder: `Συμπληρώστε τι θα διδαχθεί την εβδομάδα ${week}...`,
  };
});

function AutoGrowTextarea({ value, onChange, placeholder, id, rows = 2 }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      id={id}
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      ref={textareaRef}
      rows={rows}
      placeholder={placeholder}
      className="block w-full rounded-md px-3 py-2 text-sm text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-patras-buccaneer focus:ring-offset-0 focus:ring-patras-buccaneer dark:bg-[var(--color-bg-surface)] dark:text-[var(--color-text-primary)] dark:outline-[var(--color-border)] dark:placeholder:text-[var(--color-text-muted)] dark:focus:outline-[var(--color-primary)] dark:focus:ring-[var(--color-primary)]"
    />
  );
}

function ReadOnlyTextarea({ value, id }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      id={id}
      value={value || ""}
      readOnly
      rows={2}
      ref={textareaRef}
      className="block w-full rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 outline outline-1 -outline-offset-1 outline-gray-300 resize-none overflow-hidden dark:bg-[var(--color-bg-muted)] dark:text-[var(--color-text-primary)] dark:outline-[var(--color-border)]"
    />
  );
}

function TableShell({ children }) {
  return (
    <div className="space-y-3 pb-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)]">
        Προγραμματισμός μαθημάτων - Διδακτέα ύλη{" "}
        <span className="text-red-500">*</span>
      </label>
      <div className="overflow-hidden rounded-md outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-[var(--color-border)]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-24 border-b border-r border-gray-300 bg-gray-50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-800 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-surface)] dark:text-[var(--color-text-secondary)]">
                ΕΒΔΟΜΑΔΑ
              </th>
              <th className="border-b border-gray-300 bg-gray-50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-800 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-surface)] dark:text-[var(--color-text-secondary)]">
                ΥΛΗ ΕΒΔΟΜΑΔΑΣ
              </th>
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function WeeklyScheduleTable({ courseId, coursePlans, onFieldChange }) {
  const coursePlan = coursePlans[String(courseId)] || {};
  return (
    <TableShell>
      {COURSE_SCHEDULE_WEEK_FIELDS.map((field, index) => (
        <tr key={field.key} className={index % 2 === 0 ? "bg-white dark:bg-[var(--color-bg-card)]" : "bg-gray-50 dark:bg-[var(--color-bg-surface)]"}>
          <td className="w-24 border-b border-r border-gray-300 px-3 py-2 text-center align-middle text-sm font-semibold text-gray-700 dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)]">
            {index + 1}
          </td>
          <td className="border-b border-gray-300 px-2 py-1 align-top dark:border-[var(--color-border)]">
            <AutoGrowTextarea
              id={`course-plan-${courseId}-${field.key}`}
              value={coursePlan[field.key] || ""}
              onChange={(nextValue) => onFieldChange(courseId, field.key, nextValue)}
              placeholder={field.placeholder}
            />
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

export function ReadOnlyWeeklyScheduleTable({ courseId, coursePlans }) {
  const coursePlan = coursePlans?.[String(courseId)] || {};
  return (
    <TableShell>
      {COURSE_SCHEDULE_WEEK_FIELDS.map((field, index) => (
        <tr key={field.key} className={index % 2 === 0 ? "bg-white dark:bg-[var(--color-bg-card)]" : "bg-gray-50 dark:bg-[var(--color-bg-surface)]"}>
          <td className="w-24 border-b border-r border-gray-300 px-3 py-2 text-center align-middle text-sm font-semibold text-gray-700 dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)]">
            {index + 1}
          </td>
          <td className="border-b border-gray-300 px-2 py-1 align-top dark:border-[var(--color-border)]">
            <ReadOnlyTextarea
              id={`course-plan-view-${courseId}-${field.key}`}
              value={coursePlan[field.key] || ""}
            />
          </td>
        </tr>
      ))}
    </TableShell>
  );
}
