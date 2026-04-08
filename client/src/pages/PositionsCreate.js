import React, { useEffect, useMemo, useState } from "react";
import { useAuth, usePositions, useCreatePositionValidation } from "../contexts";
import InputField from "../components/InputField";
import CoursePanel from "../components/CoursePanel";
import FlowbiteDateField from "../components/FlowbiteDateField";
import PositionSelect from "../components/PositionSelect";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

export default function CreatePosition() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshPositions } = usePositions();
  const { updateValidity, isValid, validationErrors } = useCreatePositionValidation();

  const prefillPosition = location.state?.prefillPosition || null;
  const isEditMode = Boolean(prefillPosition);

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

  const [formData, setFormData] = useState(() => ({
    positionId: prefillPosition?.id || "",
    scientificFieldId: prefillPosition?.scientificFieldId || "",
    startDate: normalizeDateValue(prefillPosition?.startDate),
    endDate: normalizeDateValue(prefillPosition?.endDate),
    startTime: prefillPosition?.startTime || "00:00",
    endTime: prefillPosition?.endTime || "23:59",
  }));

  const [scientificFields, setScientificFields] = useState([]);
  const [selectedScientificField, setSelectedScientificField] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [redirectLoading, setRedirectLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [dateCleared, setDateCleared] = useState({ startDate: false, endDate: false });

  const markTouched = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const showError = (field) => submitted || touched[field];
  const showDateTimeError = submitted || touched.startTime || touched.endTime;

  // access control
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") navigate("/home");
  }, [currentUser, navigate]);

  // LIVE validation – run on any edit; do NOT depend on updateValidity
  useEffect(() => {
    updateValidity(formData, "position");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios({
      method: "GET",
      url: `${API_BASE_URL}/api/scientific-fields`,
      params: prefillPosition ? undefined : { availableForPosition: "true" },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => setScientificFields(response.data || []))
      .catch(() => setScientificFields([]));
  }, [prefillPosition]);

  const scientificFieldOptions = useMemo(() => {
    return (scientificFields || []).map((sf) => ({
      id: sf.id,
      scientificField: sf.name,
      school: sf.school,
      department: sf.department,
      courses: (sf.courses || []).map((course) => ({
        ...course,
        teaching_units: course.teaching_units ?? course.teachingUnits,
      })),
    }));
  }, [scientificFields]);

  const handleScientificFieldSelect = (val) => {
    markTouched("scientificFieldId");
    if (!val) {
      setSelectedScientificField(null);
      setFormData((prev) => ({
        ...prev,
        scientificFieldId: "",
      }));
      return;
    }

    const matched = scientificFieldOptions.find((sf) => String(sf.id) === String(val)) || null;
    setSelectedScientificField(matched);
    setFormData((prev) => ({
      ...prev,
      scientificFieldId: String(val),
    }));
  };

  useEffect(() => {
    if (!prefillPosition) return;
    if (prefillPosition.scientificFieldId) {
      setFormData((prev) => ({
        ...prev,
        positionId: prefillPosition.id || prev.positionId,
        scientificFieldId: String(prefillPosition.scientificFieldId),
      }));
    }
    setFormData((prev) => ({
      ...prev,
      positionId: prefillPosition.id || prev.positionId,
      startDate: normalizeDateValue(prefillPosition.startDate) || prev.startDate,
      endDate: normalizeDateValue(prefillPosition.endDate) || prev.endDate,
      startTime: prefillPosition.startTime || prev.startTime,
      endTime: prefillPosition.endTime || prev.endTime,
    }));
  }, [prefillPosition]);

  useEffect(() => {
    if (!formData.scientificFieldId) {
      setSelectedScientificField(null);
      return;
    }
    const matched = scientificFieldOptions.find((sf) => String(sf.id) === String(formData.scientificFieldId)) || null;
    setSelectedScientificField(matched);
  }, [formData.scientificFieldId, scientificFieldOptions]);

  const handleCourseChange = () => {};
  const addCourse = () => {};
  const removeCourse = () => {};

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errors = updateValidity(formData, "position");
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setNotification({ message: "", type: "" });

    const payload = {
      positionId: formData.positionId || undefined,
      scientificFieldId: formData.scientificFieldId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };

    try {
      const token = localStorage.getItem("token");
      await axios({
        method: "POST",
        url: `${API_BASE_URL}/api/positions`,
        data: payload,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setNotification({ message: isEditMode ? "Η θέση ενημερώθηκε με επιτυχία!" : "Η θέση δημιουργήθηκε με επιτυχία!", type: "success" });
      setSubmitting(false);
      if (refreshPositions) {
        await refreshPositions();
      }
      setTimeout(() => {
        setRedirectLoading(true);
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      }, 500);
    } catch (error) {
      const message = error?.response?.data?.error || "Αποτυχία δημιουργίας θέσης. Παρακαλώ δοκιμάστε ξανά.";
      setNotification({ message, type: "error" });
      setSubmitting(false);
    }
  };

  const submitDisabled = submitting || !isValid;

  if (redirectLoading) {
    return (
      <div className="flex justify-center min-h-screen min-w-screen">
        <div className="w-[1270px] px-7 py-4 flex flex-col min-h-screen">
          <div className="flex flex-1 justify-center items-center py-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-patras-buccaneer"></div>
              <p className="mt-4 text-gray-600">Φόρτωση...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {submitting && (
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin h-6 w-6 text-patras-buccaneer"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span className="ml-2 text-patras-buccaneer">Υποβολή αίτησης...</span>
        </div>
      )}
      <header className="text-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          {isEditMode ? "Ενημέρωση Θέσης" : "Δημιουργία θέσης"}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {isEditMode
            ? "Ενημερώστε τα στοιχεία της θέσης και την χρονική περίδο των αιτήσεων της."
            : "Ορίστε τα στοιχεία της νέας θέσης και την χρονική περίδο των αιτήσεων της."}
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-10 bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-patras-albescentWhite-50"
      >
        {/* BASIC INFO */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-1">Βασικές πληροφορίες</h2>

          <div className="grid grid-cols-1 gap-6">
            <PositionSelect
              positions={scientificFieldOptions}
              value={formData.scientificFieldId}
              onChange={handleScientificFieldSelect}
              label="Επιστημονικό πεδίο"
              placeholder="Αναζήτηστε με σχολή, τμήμα ή επιστημονικό πεδίο..."
              maxResults={50}
              error={showError("scientificFieldId") ? validationErrors.scientificFieldId : ""}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <InputField
              label="Σχολή"
              value={selectedScientificField?.school || ""}
              onChange={() => {}}
              disabled
              required
            />

            <InputField
              label="Τμήμα"
              value={selectedScientificField?.department || ""}
              onChange={() => {}}
              disabled
              required
            />
          </div>
        </section>

        {/* COURSES */}
        <CoursePanel
          courses={selectedScientificField?.courses || []}
          onCourseChange={handleCourseChange}
          onAddCourse={addCourse}
          onRemoveCourse={removeCourse}
          showAddButton={false}
          disabled
          scientificFieldValue={selectedScientificField?.scientificField || "select"}
          errors={validationErrors}
        />

        {/* DATES */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-1">Ημερομηνίες</h2>
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
                required
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
                required
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
              error={showError("startTime") ? validationErrors.startTime : ""}
              required
            />
            <InputField
              label="Ώρα λήξης"
              type="time"
              value={formData.endTime}
              onChange={(val) => {
                markTouched("endTime");
                setFormData({ ...formData, endTime: val });
              }}
              error={showError("endTime") ? validationErrors.endTime : ""}
              required
            />
          </div>

          {showDateTimeError && validationErrors?.dateTimeRange && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.dateTimeRange}</p>
          )}
        </section>

        {/* SUBMIT */}
        <div className="pt-6 border-t text-right">
          <button
            type="submit"
            disabled={submitDisabled}
            aria-disabled={submitDisabled}
            className="px-6 py-2 bg-patras-buccaneer text-white font-medium rounded-lg hover:bg-patras-sanguineBrown transition disabled:opacity-60"
          >
            {submitting ? (isEditMode ? "Ενημέρωση..." : "Δημιουργία...") : (isEditMode ? "Ενημέρωση Θέσης" : "Δημιουργία θέσης")}
          </button>

          {notification.message && (
            <p
              className={`mt-3 text-sm font-medium ${notification.type === "success" ? "text-green-600" : "text-red-600"
                }`}
            >
              {notification.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
