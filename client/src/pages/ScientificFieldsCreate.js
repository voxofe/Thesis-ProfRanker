import React, { useEffect, useMemo, useState } from "react";
import { useAuth, useCreatePositionValidation } from "../contexts";
import { useToast } from "../contexts/ToastContext";
import InputField from "../components/InputField";
import CustomSelect from "../components/CustomSelect";
import CoursePanel from "../components/CoursePanel";
import FlowbiteDateField from "../components/FlowbiteDateField";
import SubmissionProgress from "../components/SubmissionProgress";
import LoadingIndicator from "../components/LoadingIndicator";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const SCHOOLS = [
  "ΘΕΤΙΚΩΝ ΕΠΙΣΤΗΜΩΝ",
  "ΠΟΛΥΤΕΧΝΙΚΗ",
  "ΕΠΙΣΤΗΜΩΝ ΥΓΕΙΑΣ",
  "ΑΝΘΡΩΠΙΣΤΙΚΩΝ & ΚΟΙΝΩΝΙΚΩΝ ΕΠΙΣΤΗΜΩΝ",
  "ΟΙΚΟΝΟΜΙΚΩΝ ΕΠΙΣΤΗΜΩΝ & ΔΙΟΙΚΗΣΗΣ",
  "ΓΕΩΠΟΝΙΚΩΝ ΕΠΙΣΤΗΜΩΝ",
  "ΕΠΙΣΤΗΜΩΝ ΑΠΟΚΑΤΑΣΤΑΣΗΣ ΥΓΕΙΑΣ",
];

const DEPARTMENTS = {
  "ΘΕΤΙΚΩΝ ΕΠΙΣΤΗΜΩΝ": ["ΒΙΟΛΟΓΙΑΣ", "ΜΑΘΗΜΑΤΙΚΩΝ", "ΓΕΩΛΟΓΙΑΣ", "ΦΥΣΙΚΗΣ", "ΕΠΙΣΤΗΜΗΣ ΤΩΝ ΥΛΙΚΩΝ", "ΧΗΜΕΙΑΣ"],
  "ΠΟΛΥΤΕΧΝΙΚΗ": [
    "ΑΡΧΙΤΕΚΤΟΝΩΝ ΜΗΧΑΝΙΚΩΝ",
    "ΜΗΧΑΝΟΛΟΓΩΝ & ΑΕΡΟΝΑΥΠΗΓΩΝ ΜΗΧΑΝΙΚΩΝ",
    "ΗΛΕΚΤΡΟΛΟΓΩΝ ΜΗΧΑΝΙΚΩΝ & ΤΕΧΝΟΛΟΓΙΑΣ ΥΠΟΛΟΓΙΣΤΩΝ",
    "ΠΟΛΙΤΙΚΩΝ ΜΗΧΑΝΙΚΩΝ",
    "ΜΗΧΑΝΙΚΩΝ ΗΛΕΚΤΡΟΝΙΚΩΝ ΥΠΟΛΟΓΙΣΤΩΝ & ΠΛΗΡΟΦΟΡΙΚΗΣ",
    "ΧΗΜΙΚΩΝ ΜΗΧΑΝΙΚΩΝ",
  ],
  "ΕΠΙΣΤΗΜΩΝ ΥΓΕΙΑΣ": ["ΙΑΤΡΙΚΗΣ", "ΦΑΡΜΑΚΕΥΤΙΚΗΣ"],
  "ΑΝΘΡΩΠΙΣΤΙΚΩΝ & ΚΟΙΝΩΝΙΚΩΝ ΕΠΙΣΤΗΜΩΝ": [
    "ΕΠΙΣΤΗΜΩΝ ΤΗΣ ΕΚΠΑΙΔΕΥΣΗΣ & ΚΟΙΝΩΝΙΚΗΣ ΕΡΓΑΣΙΑΣ",
    "ΙΣΤΟΡΙΑΣ - ΑΡΧΑΙΟΛΟΓΙΑΣ",
    "ΕΠΙΣΤΗΜΩΝ ΤΗΣ ΕΚΠΑΙΔΕΥΣΗΣ & ΑΓΩΓΗΣ ΣΤΗΝ ΠΡΟΣΧΟΛΙΚΗ ΗΛΙΚΙΑ",
    "ΦΙΛΟΛΟΓΙΑΣ",
    "ΘΕΑΤΡΙΚΩΝ ΣΠΟΥΔΩΝ",
    "ΦΙΛΟΣΟΦΙΑΣ",
  ],
  "ΟΙΚΟΝΟΜΙΚΩΝ ΕΠΙΣΤΗΜΩΝ & ΔΙΟΙΚΗΣΗΣ": ["ΔΙΟΙΚΗΣΗΣ ΕΠΙΧΕΙΡΗΣΕΩΝ", "ΔΙΟΙΚΗΤΙΚΗΣ ΕΠΙΣΤΗΜΗΣ & ΤΕΧΝΟΛΟΓΙΑΣ", "ΔΙΟΙΚΗΣΗΣ ΤΟΥΡΙΣΜΟΥ", "ΟΙΚΟΝΟΜΙΚΩΝ ΕΠΙΣΤΗΜΩΝ"],
  "ΓΕΩΠΟΝΙΚΩΝ ΕΠΙΣΤΗΜΩΝ": ["ΓΕΩΠΟΝΙΑΣ", "ΑΛΙΕΙΑΣ & ΥΔΑΤΟΚΑΛΛΙΕΡΓΕΙΩΝ", "ΕΠΙΣΤΗΜΗΣ & ΤΕΧΝΟΛΟΓΙΑΣ ΤΡΟΦΙΜΩΝ", "ΑΕΙΦΟΡΙΚΗΣ ΓΕΩΡΓΙΑΣ"],
  "ΕΠΙΣΤΗΜΩΝ ΑΠΟΚΑΤΑΣΤΑΣΗΣ ΥΓΕΙΑΣ": ["ΛΟΓΟΘΕΡΑΠΕΙΑΣ", "ΝΟΣΗΛΕΥΤΙΚΗΣ", "ΦΥΣΙΚΟΘΕΡΑΠΕΙΑΣ"],
};

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

export default function ScientificFieldsCreate() {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { updateValidity, isValid, validationErrors } = useCreatePositionValidation();

  const prefillScientificField = location.state?.prefillScientificField || null;
  const isEditMode = Boolean(prefillScientificField?.id);
  const isEditHash = location.hash === "#edit";
  const showPositionFields =
    isEditMode &&
    isEditHash &&
    prefillScientificField?.state === "pending";

  const todayISO = () => new Date().toISOString().split("T")[0];

  const normalizeDateValue = (value) => {
    if (!value) return "";
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().split("T")[0];
    }
    const normalizeDateOnly = (dateStr) => {
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        return `${dateStr.slice(6, 10)}-${dateStr.slice(3, 5)}-${dateStr.slice(0, 2)}`;
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return `${dateStr.slice(6, 10)}-${dateStr.slice(3, 5)}-${dateStr.slice(0, 2)}`;
      }
      if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) {
        return dateStr.replace(/\//g, "-");
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      return "";
    };

    const str = String(value).trim();
    const trimmed = str.includes("T")
      ? str.split("T")[0]
      : str.includes(" ")
        ? str.split(" ")[0]
        : str;
    const normalized = normalizeDateOnly(trimmed);
    if (normalized) return normalized;
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
    return "";
  };

  const normalizeCourse = (course) => ({
    code: course?.code || "",
    name: course?.name || "",
    description: course?.description || "",
    semester: course?.semester || "select",
    teaching_units: course?.teaching_units ?? course?.teachingUnits ?? "",
    ects: course?.ects ?? "",
    theory_hours: course?.theory_hours ?? "",
    lab_hours: course?.lab_hours ?? "",
    category: course?.category || "select",
  });

  const [formData, setFormData] = useState(() => ({
    school: prefillScientificField?.school || "select",
    department: prefillScientificField?.department || "select",
    scientificField: prefillScientificField?.name || "",
    courses: Array.isArray(prefillScientificField?.courses)
      ? prefillScientificField.courses.map(normalizeCourse)
      : [],
    startDate: normalizeDateValue(prefillScientificField?.positionStartDate),
    endDate: normalizeDateValue(prefillScientificField?.positionEndDate),
    startTime: prefillScientificField?.positionStartTime || "",
    endTime: prefillScientificField?.positionEndTime || "",
  }));

  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressTarget, setProgressTarget] = useState(0);
  const [redirectLoading, setRedirectLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [dateCleared, setDateCleared] = useState({ startDate: false, endDate: false });
  const progressTimerRef = React.useRef(null);
  const progressPercentRef = React.useRef(0);

  const markTouched = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const showError = (field) => submitted || touched[field];
  const showCourseError = submitted || touched.courses;
  const showDateTimeError = submitted || touched.startTime || touched.endTime;
  const progressLabel = isEditMode
    ? `Ενημέρωση πεδίου ${formData.scientificField || ""}`
    : `Δημιουργία πεδίου ${formData.scientificField || ""}`;

  useEffect(() => {
    progressPercentRef.current = progressPercent;
  }, [progressPercent]);

  useEffect(() => {
    if (!submitting) {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      return;
    }

    if (progressTimerRef.current) return;
    progressTimerRef.current = setInterval(() => {
      setProgressPercent((prev) => {
        const nextTarget = typeof progressTarget === "number" ? progressTarget : 0;
        if (prev >= nextTarget) return prev;
        const step = Math.max(1, Math.ceil((nextTarget - prev) * 0.05));
        return Math.min(nextTarget, prev + step);
      });
    }, 160);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [submitting, progressTarget]);

  const waitForProgressToComplete = async (timeoutMs = 2400) => {
    const start = Date.now();
    while (progressPercentRef.current < 100 && Date.now() - start < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  const completeProgressBar = async () => {
    setProgressTarget(100);
    await waitForProgressToComplete();
    // Guarantee completion even if interval ticks are delayed.
    setProgressPercent(100);
  };

  // access control
  useEffect(() => {
    if (isLoading) return;
    if (!currentUser || currentUser.role !== "admin") navigate("/home");
  }, [currentUser, isLoading, navigate]);

  useEffect(() => {
    if (!prefillScientificField) return;
    setFormData({
      school: prefillScientificField.school || "select",
      department: prefillScientificField.department || "select",
      scientificField: prefillScientificField.name || "",
      courses: Array.isArray(prefillScientificField.courses)
        ? prefillScientificField.courses.map(normalizeCourse)
        : [],
      startDate: normalizeDateValue(prefillScientificField.positionStartDate),
      endDate: normalizeDateValue(prefillScientificField.positionEndDate),
      startTime: prefillScientificField.positionStartTime || "",
      endTime: prefillScientificField.positionEndTime || "",
    });
  }, [prefillScientificField]);

  // LIVE validation – run on any edit; do NOT depend on updateValidity
  useEffect(() => {
    updateValidity(formData, "scientificField");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // department options
  const departmentOptions = useMemo(() => {
    const deps = formData.school && formData.school !== "select"
      ? DEPARTMENTS[formData.school] || []
      : Object.values(DEPARTMENTS).flat();
    return deps.sort((a, b) => a.localeCompare(b, "el"));
  }, [formData.school]);

  // course handlers
  const handleCourseChange = (idx, field, value) => {
    markTouched("courses");
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    }));
  };

  const addCourse = () => {
    markTouched("courses");
    setFormData((prev) => ({
      ...prev,
      courses: [
        ...prev.courses,
        {
          code: "",
          name: "",
          description: "",
          semester: "select",
          teaching_units: "",
          ects: "",
          theory_hours: "",
          lab_hours: "",
          category: "select",
        },
      ],
    }));
  };

  const removeCourse = (idx) => {
    markTouched("courses");
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== idx),
    }));
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errors = updateValidity(formData, "scientificField");
    if (Object.keys(errors).length > 0) return;

    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      if (document?.documentElement) document.documentElement.scrollTop = 0;
      if (document?.body) document.body.scrollTop = 0;
    }

    setSubmitting(true);
    setProgressPercent(0);
    setProgressTarget(0);

    const payload = {
      name: formData.scientificField,
      school: formData.school,
      department: formData.department,
      courses: JSON.stringify(formData.courses || []),
    };

    const hasPositionFields =
      showPositionFields && (
        formData.startDate ||
        formData.endDate ||
        formData.startTime ||
        formData.endTime
      );

    try {
      const token = localStorage.getItem("token");
      const response = await axios({
        method: isEditMode ? "PUT" : "POST",
        url: isEditMode
          ? `${API_BASE_URL}/api/scientific-fields/${prefillScientificField.id}`
          : `${API_BASE_URL}/api/scientific-fields`,
        data: payload,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        onUploadProgress: (event) => {
          if (!event.total) return;
          const raw = Math.round((event.loaded / event.total) * 100);
          const scaled = hasPositionFields ? Math.round(raw * 0.8) : raw;
          const capped = hasPositionFields ? Math.min(80, scaled) : Math.min(100, scaled);
          setProgressTarget(capped);
        },
      });

      setProgressTarget(hasPositionFields ? 80 : 100);

      if (hasPositionFields) {
        const sfId = isEditMode
          ? prefillScientificField.id
          : response?.data?.scientificFieldId;
        if (sfId) {
          try {
            await axios({
              method: "POST",
              url: `${API_BASE_URL}/api/positions`,
              data: {
                positionId: prefillScientificField?.positionId || undefined,
                scientificFieldId: sfId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                startTime: formData.startTime,
                endTime: formData.endTime,
              },
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              onUploadProgress: (event) => {
                if (!event.total) return;
                const raw = Math.round((event.loaded / event.total) * 100);
                const scaled = 80 + Math.round(raw * 0.2);
                setProgressTarget(Math.min(98, scaled));
              },
            });
            setProgressTarget(100);
          } catch (positionError) {
            const message =
              positionError?.response?.data?.error ||
              "Αποτυχία ενημέρωσης ημερομηνιών θέσης.";
            showToast({ type: "error", message });
          }
        }
      }

      await completeProgressBar();

      showToast({
        type: "success",
        message: isEditMode
          ? "Το επιστημονικό πεδίο ενημερώθηκε με επιτυχία!"
          : "Το επιστημονικό πεδίο δημιουργήθηκε με επιτυχία!",
      });

      if (isEditMode) {
        setSubmitting(false);
        navigate(`/scientific-fields/view/${prefillScientificField.id}`);
        return;
      }
      const createdId = response?.data?.scientificFieldId;
      if (createdId) {
        setSubmitting(false);
        navigate(`/scientific-fields/view/${createdId}`);
        return;
      }
      setSubmitting(false);
      setTimeout(() => {
        setRedirectLoading(true);
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      }, 500);
    } catch (error) {
      const message = error?.response?.data?.error || "Αποτυχία δημιουργίας πεδίου. Παρακαλώ δοκιμάστε ξανά.";
      showToast({ type: "error", message });
      setSubmitting(false);
      setProgressPercent(0);
      setProgressTarget(0);
    }
  };

  const submitDisabled = submitting || !isValid;

  if (redirectLoading) {
    return (
      <div className="flex justify-center min-h-screen min-w-screen">
        <div className="w-[1270px] px-7 py-4 flex flex-col min-h-screen">
          <div className="flex flex-1 justify-center items-center py-4">
            <LoadingIndicator />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-0 space-y-4">
      <SubmissionProgress
        loading={submitting}
        submitLabel={progressLabel}
        statusText=""
        percent={progressPercent}
      />
      <header className="text-center pb-2">
        <h1 className="text-2xl text-center border-b pb-2 text-gray-800">
          {isEditMode ? "Ενημέρωση πεδίου" : "Δημιουργία πεδίου"}
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-10 bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-patras-albescentWhite-50"
        noValidate
      >
        {/* BASIC INFO */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-1">Βασικές πληροφορίες</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Όνομα επιστημονικού πεδίου"
              value={formData.scientificField}
              onChange={(val) => {
                markTouched("scientificField");
                setFormData((prev) => ({ ...prev, scientificField: val }));
              }}
              disabled={submitting}
              required
              error={showError("scientificField") ? validationErrors.scientificField : ""}
            />

            <div className="hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
            <CustomSelect
              label="Σχολή"
              value={formData.school}
              onChange={(val) => {
                markTouched("school");
                setFormData((prev) => ({ ...prev, school: val, department: "select" }));
              }}
              options={SCHOOLS.map((s) => ({ value: s, label: s }))}
              disabled={submitting}
              required
              error={showError("school") ? validationErrors.school : ""}
            />

            <CustomSelect
              label="Τμήμα"
              value={formData.department}
              onChange={(val) =>
                {
                  markTouched("department");
                  setFormData((prev) => {
                    const updated = { ...prev, department: val };
                    if (val !== "select") {
                      const found = Object.entries(DEPARTMENTS).find(([school, deps]) => deps.includes(val));
                      if (found) updated.school = found[0];
                    }
                    return updated;
                  });
                }
              }
              options={departmentOptions.map((d) => ({ value: d, label: d }))}
              disabled={submitting}
              required
              error={showError("department") ? validationErrors.department : ""}
            />
          </div>
        </section>

        {/* COURSES */}
        <CoursePanel
          courses={formData.courses}
          onCourseChange={handleCourseChange}
          onAddCourse={addCourse}
          onRemoveCourse={removeCourse}
          showAddButton
          disabled={submitting}
          scientificFieldValue={formData.scientificField}
          errors={validationErrors}
        />
        {showCourseError && validationErrors.courses && (
          <p className="-mt-6 text-sm text-red-600">{validationErrors.courses}</p>
        )}

        {showPositionFields && (
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-1">Στοιχεία θέσης</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FlowbiteDateField
                  label="Ημερομηνία έναρξης"
                  value={formData.startDate}
                  onChange={(val) => {
                    markTouched("startDate");
                    setFormData({ ...formData, startDate: val });
                    if (val) {
                      setDateCleared((prev) => ({ ...prev, startDate: false }));
                    }
                  }}
                  onClear={() => {
                    markTouched("startDate");
                    setDateCleared((prev) => ({ ...prev, startDate: true }));
                  }}
                  minDate={todayISO()}
                  maxDate={formData.endDate || undefined}
                  popupAlign="right"
                  readOnly={submitting}
                  disabled={submitting}
                  required={Boolean(
                    formData.startDate ||
                    formData.endDate ||
                    formData.startTime ||
                    formData.endTime
                  )}
                />
                {showError("startDate") && validationErrors.startDate && (
                  <p className="-mt-3 text-sm text-red-600">{validationErrors.startDate}</p>
                )}
              </div>
              <div>
                <FlowbiteDateField
                  label="Ημερομηνία λήξης"
                  value={formData.endDate}
                  onChange={(val) => {
                    markTouched("endDate");
                    setFormData({ ...formData, endDate: val });
                    if (val) {
                      setDateCleared((prev) => ({ ...prev, endDate: false }));
                    }
                  }}
                  onClear={() => {
                    markTouched("endDate");
                    setDateCleared((prev) => ({ ...prev, endDate: true }));
                  }}
                  minDate={formData.startDate || todayISO()}
                  popupAlign="right"
                  readOnly={submitting}
                  disabled={submitting}
                  required={Boolean(
                    formData.startDate ||
                    formData.endDate ||
                    formData.startTime ||
                    formData.endTime
                  )}
                />
                {showError("endDate") && validationErrors.endDate && (
                  <p className="-mt-3 text-sm text-red-600">{validationErrors.endDate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <InputField
                label="Ώρα έναρξης"
                type="time"
                value={formData.startTime}
                onChange={(val) => {
                  markTouched("startTime");
                  setFormData({ ...formData, startTime: val });
                }}
                disabled={submitting}
                error={showError("startTime") ? validationErrors.startTime : ""}
                required={Boolean(
                  formData.startDate ||
                  formData.endDate ||
                  formData.startTime ||
                  formData.endTime
                )}
              />
              <InputField
                label="Ώρα λήξης"
                type="time"
                value={formData.endTime}
                onChange={(val) => {
                  markTouched("endTime");
                  setFormData({ ...formData, endTime: val });
                }}
                disabled={submitting}
                error={showError("endTime") ? validationErrors.endTime : ""}
                required={Boolean(
                  formData.startDate ||
                  formData.endDate ||
                  formData.startTime ||
                  formData.endTime
                )}
              />
            </div>

            {showDateTimeError && validationErrors?.dateTimeRange && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.dateTimeRange}</p>
            )}
          </section>
        )}

        {/* SUBMIT */}
        <div className="pt-6 border-t text-right">
          <button
            type="submit"
            disabled={submitDisabled}
            aria-disabled={submitDisabled}
            className="px-6 py-2 bg-patras-buccaneer text-white font-medium rounded-lg hover:bg-patras-sanguineBrown transition disabled:opacity-60"
          >
            {submitting
              ? isEditMode
                ? "Ενημέρωση..."
                : "Δημιουργία..."
              : isEditMode
                ? "Ενημέρωση πεδίου"
                : "Δημιουργία πεδίου"}
          </button>
        </div>
      </form>
    </div>
  );
}
