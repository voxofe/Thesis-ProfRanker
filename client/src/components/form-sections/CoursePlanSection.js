import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { usePositions } from "../../contexts/PositionsContext";
import TooltipGray from "../TooltipGray";

function AutoGrowTextarea({ value, onChange, placeholder, id }) {
  const textareaRef = useRef(null);
  const [minHeight, setMinHeight] = useState(0);

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
    const nextHeight = Math.max(
      element.scrollHeight,
      minHeight || element.scrollHeight
    );
    element.style.height = `${nextHeight}px`;
  }, [value, minHeight]);

  return (
    <textarea
      id={id}
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      ref={textareaRef}
      rows={12}
      placeholder={placeholder}
      className="block w-full rounded-md px-3 py-2 text-sm text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-patras-buccaneer focus:ring-offset-0 focus:ring-patras-buccaneer"
    />
  );
}

const COURSE_PLAN_FIELDS = [
  {
    key: "generalDescription",
    label: "Γενική περιγραφή μαθήματος",
    placeholder: "Συμπληρώστε γενική περιγραφή για το μάθημα...",
  },
  {
    key: "learningObjectives",
    label: "Μαθησιακοί στόχοι",
    placeholder: "Συμπληρώστε μαθησιακούς στόχους...",
  },
  {
    key: "courseSchedule",
    label: "Προγραμματισμός μαθημάτων - Διδακτέα ύλη",
    placeholder: "Συμπληρώστε προγραμματισμό μαθημάτων και διδακτέα ύλη...",
  },
  {
    key: "deliveryMethods",
    label: "Τρόπος παράδοσης & διδακτικές μέθοδοι",
    placeholder: "Συμπληρώστε τρόπο παράδοσης και διδακτικές μεθόδους...",
  },
  {
    key: "bibliographyMaterial",
    label: "Βιβλιογραφία - Εκπαιδευτικό υλικό",
    placeholder: "Συμπληρώστε βιβλιογραφία και εκπαιδευτικό υλικό...",
  },
  {
    key: "learningOutcomes",
    label: "Μαθησιακά αποτελέσματα",
    placeholder: "Συμπληρώστε μαθησιακά αποτελέσματα...",
  },
  {
    key: "assessmentMethodsCriteria",
    label: "Μέθοδοι και κριτήρια αξιολόγησης",
    placeholder: "Συμπληρώστε μεθόδους και κριτήρια αξιολόγησης...",
  },
];

export default function CoursePlanSection() {
  const { formData, handleCoursePlanFieldChange } = useFormData();
  const { positions = [] } = usePositions();
  const tabsViewportRef = useRef(null);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const selectedPosition = useMemo(
    () => positions.find((position) => String(position.id) === String(formData.positionId)) || null,
    [positions, formData.positionId]
  );

  const courses = Array.isArray(selectedPosition?.courses) ? selectedPosition.courses : [];

  const updateScrollControls = () => {
    const el = tabsViewportRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
  };

  useEffect(() => {
    updateScrollControls();
    const el = tabsViewportRef.current;
    if (!el) return;

    const onScroll = () => updateScrollControls();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollControls);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollControls);
    };
  }, [courses.length]);

  useEffect(() => {
    if (!courses.length) {
      setActiveCourseId(null);
      return;
    }

    const exists = courses.some((course) => String(course.id) === String(activeCourseId));
    if (!activeCourseId || !exists) {
      setActiveCourseId(courses[0].id);
    }
  }, [courses, activeCourseId]);

  const activeCourse = useMemo(
    () => courses.find((course) => String(course.id) === String(activeCourseId)) || courses[0] || null,
    [courses, activeCourseId]
  );

  const scrollTabsBy = (offset) => {
    const el = tabsViewportRef.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  const isCourseComplete = (courseId) => {
    const coursePlan = (formData.coursePlans || {})[String(courseId)] || {};
    return COURSE_PLAN_FIELDS.every((field) => {
      const value = coursePlan[field.key];
      return typeof value === "string" && value.trim().length > 0;
    });
  };

  if (!selectedPosition) {
    return (
      <section className="space-y-3">
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Επιλέξτε πρώτα επιστημονικό πεδίο στο προηγούμενο βήμα.
        </p>
      </section>
    );
  }

  if (!courses.length) {
    return (
      <section className="space-y-3">
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Δεν υπάρχουν μαθήματα για την επιλεγμένη θέση.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <div>
          <label className="block text-sm/6 font-medium text-gray-900">
            Μαθήματα πεδίου:{" "}
            <span className="font-semibold underline text-patras-buccaneer">
              {selectedPosition?.scientificField || ""}
            </span>{" "}
            ({courses.length} συνολικά)
            <TooltipGray content="Συμπληρώστε το σχεδιάγραμμα διδασκαλίας για όλα τα μαθήματα του επιστημονικού πεδίου">
              <span className="ml-2 inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-gray-300 text-xs text-gray-600">
                i
              </span>
            </TooltipGray>
          </label>
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
              {courses.map((course, index) => {
                const isActive = String(course.id) === String(activeCourse?.id);
                const isComplete = isCourseComplete(course.id);
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setActiveCourseId(course.id)}
                    className={`inline-flex w-max shrink-0 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "border-patras-buccaneer bg-patras-buccaneer text-white"
                        : isComplete
                          ? "border-green-300 bg-green-50 text-green-800 hover:border-green-500"
                          : "border-gray-300 bg-white text-gray-700 hover:border-patras-buccaneer"
                    }`}
                    title={course.name || `Μάθημα ${index + 1}`}
                  >
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      {course.name || `Μάθημα ${index + 1}`}
                      {isComplete ? <span aria-hidden="true">✓</span> : null}
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
        <div>
          <label className="block text-sm/6 font-medium text-gray-900">
            Σχεδιάγραμμα διδασκαλίας για{" "}
            <span className="font-semibold underline text-patras-buccaneer">
              {activeCourse?.name || "Χωρίς τίτλο"}
            </span>{" "}
            (Μάθημα {courses.findIndex((course) => String(course.id) === String(activeCourse?.id)) + 1}/{courses.length})
          </label>
        </div>

        {activeCourse ? (
          <article key={activeCourse.id}>
            <div className="rounded-md border border-gray-300 p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4">
                {COURSE_PLAN_FIELDS.map((field) => {
                  const coursePlan = (formData.coursePlans || {})[String(activeCourse.id)] || {};
                  return (
                    <div key={`${activeCourse.id}-${field.key}`} className="space-y-3 pb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label} <span className="text-red-500">*</span>
                      </label>
                      <AutoGrowTextarea
                        id={`course-plan-${activeCourse.id}-${field.key}`}
                        value={coursePlan[field.key] || ""}
                        onChange={(nextValue) =>
                          handleCoursePlanFieldChange(activeCourse.id, field.key, nextValue)
                        }
                        placeholder={field.placeholder}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}