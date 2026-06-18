import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useBodyScrollLock from "../utils/useBodyScrollLock";
import { ReadOnlyWeeklyScheduleTable, COURSE_SCHEDULE_WEEK_FIELDS } from "./WeeklyScheduleTable";

const COURSE_PLAN_FIELDS = [
  {
    key: "generalDescription",
    label: "Γενική περιγραφή μαθήματος",
  },
  {
    key: "learningObjectives",
    label: "Μαθησιακοί στόχοι",
  },
  {
    key: "deliveryMethods",
    label: "Τρόπος παράδοσης & διδακτικές μέθοδοι",
  },
  {
    key: "bibliographyMaterial",
    label: "Βιβλιογραφία - Εκπαιδευτικό υλικό",
  },
  {
    key: "learningOutcomes",
    label: "Μαθησιακά αποτελέσματα",
  },
  {
    key: "assessmentMethodsCriteria",
    label: "Μέθοδοι και κριτήρια αξιολόγησης",
  },
];

function ReadOnlyAutoGrowTextarea({ value, id }) {
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
      rows={1}
      ref={textareaRef}
      className="block w-full rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 outline outline-1 -outline-offset-1 outline-patras-buccaneer/70 placeholder:text-gray-400 resize-none overflow-hidden"
    />
  );
}

export default function CoursePlanDetailsModal({
  open,
  onClose,
  scientificField,
  courses = [],
  coursePlans = {},
}) {
  useBodyScrollLock(open);

  const [activeCourseId, setActiveCourseId] = useState(null);
  const tabsViewportRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const normalizedCourses = useMemo(() => (Array.isArray(courses) ? courses : []), [courses]);

  useEffect(() => {
    if (!open) return;
    if (!normalizedCourses.length) {
      setActiveCourseId(null);
      return;
    }
    const exists = normalizedCourses.some((course) => String(course.id) === String(activeCourseId));
    if (!activeCourseId || !exists) {
      setActiveCourseId(normalizedCourses[0].id);
    }
  }, [open, normalizedCourses, activeCourseId]);

  useEffect(() => {
    if (!open) return;
    const el = tabsViewportRef.current;
    if (!el) return;

    const update = () => {
      const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
    };

    update();
    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [open, normalizedCourses.length]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const activeCourse =
    normalizedCourses.find((course) => String(course.id) === String(activeCourseId)) ||
    normalizedCourses[0] ||
    null;

  const scrollTabsBy = (offset) => {
    const el = tabsViewportRef.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg border w-full max-w-6xl relative flex flex-col max-h-[90vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Σχεδιάγραμμα διδασκαλίας</h2>
            <p className="text-sm text-gray-600">
              {scientificField || "—"} · {normalizedCourses.length} μαθήματα
            </p>
          </div>
          <button
            type="button"
            className="text-gray-600 hover:text-red-700 text-2xl leading-none"
            onClick={onClose}
            title="Κλείσιμο"
            aria-label="Κλείσιμο"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1 min-h-0 space-y-5">
          <div className="space-y-2">
            <div className="block text-sm/6 font-medium text-gray-900">
              Μαθήματα πεδίου:{" "}
              <span className="font-semibold underline text-patras-buccaneer">
                {scientificField || ""}
              </span>{" "}
              ({normalizedCourses.length} συνολικά)
            </div>

            <div className="rounded-lg border border-patras-buccaneer bg-white p-2 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollTabsBy(-220)}
                  disabled={!canScrollLeft}
                  className="h-8 w-8 shrink-0 rounded-full border border-gray-300 text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Προηγούμενες καρτέλες μαθημάτων"
                >
                  {"<"}
                </button>

                <div ref={tabsViewportRef} className="flex-1 overflow-x-auto scroll-smooth" style={{ scrollbarWidth: "none" }}>
                  <div className="flex min-w-max items-center gap-2 pr-1">
                    {normalizedCourses.map((course, index) => {
                      const isActive = String(course.id) === String(activeCourse?.id);
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => setActiveCourseId(course.id)}
                          className={`inline-flex w-max shrink-0 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? "border-patras-buccaneer bg-patras-buccaneer text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:border-patras-buccaneer"
                          }`}
                          title={course.name || `Μάθημα ${index + 1}`}
                        >
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            {course.name || `Μάθημα ${index + 1}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => scrollTabsBy(220)}
                  disabled={!canScrollRight}
                  className="h-8 w-8 shrink-0 rounded-full border border-gray-300 text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Επόμενες καρτέλες μαθημάτων"
                >
                  {">"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="block text-sm/6 font-medium text-gray-900">
              Σχεδιάγραμμα διδασκαλίας για{" "}
              <span className="font-semibold underline text-patras-buccaneer">
                {activeCourse?.name || "Χωρίς τίτλο"}
              </span>{" "}
              (Μάθημα {normalizedCourses.findIndex((course) => String(course.id) === String(activeCourse?.id)) + 1}/{normalizedCourses.length})
            </div>

            {activeCourse ? (
              <article key={activeCourse.id}>
                <div className="rounded-md border border-patras-buccaneer p-4 md:p-5">
                  <div className="grid grid-cols-1 gap-4">
                    {COURSE_PLAN_FIELDS.map((field) => {
                      const coursePlan = coursePlans?.[String(activeCourse.id)] || {};
                      return (
                        <div key={`${activeCourse.id}-${field.key}`} className="space-y-3 pb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            {field.label}
                          </label>
                          <ReadOnlyAutoGrowTextarea
                            id={`course-plan-view-${activeCourse.id}-${field.key}`}
                            value={coursePlan[field.key] || ""}
                          />
                        </div>
                      );
                    })}

                    <ReadOnlyWeeklyScheduleTable
                      courseId={activeCourse.id}
                      coursePlans={coursePlans}
                    />
                  </div>
                </div>
              </article>
            ) : (
              <p className="text-sm text-gray-500">Δεν υπάρχουν διαθέσιμα μαθήματα.</p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}