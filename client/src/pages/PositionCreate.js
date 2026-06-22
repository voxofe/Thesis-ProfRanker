import React, { useEffect, useMemo, useState } from "react";
import { useAuth, usePositions, useCreatePositionValidation } from "../contexts";
import InputField from "../components/InputField";
import CoursePanel from "../components/CoursePanel";
import FlowbiteDateField from "../components/FlowbiteDateField";
import PositionSelect from "../components/PositionSelect";
import LoadingIndicator from "../components/LoadingIndicator";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

export default function CreatePosition({ prefillPosition: prefillPositionProp = null, inModal = false, onSuccess, onCancel }) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshPositions } = usePositions();
  const { updateValidity, isValid, validationErrors } = useCreatePositionValidation();

  const prefillPosition = prefillPositionProp || location.state?.prefillPosition || null;

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
  const { showToast } = useToast();
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
    if (isLoading) return;
    if (!currentUser || currentUser.role !== "admin") navigate("/home");
  }, [currentUser, isLoading, navigate]);

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

    const confirmMessage =
      "Από την ημερομηνία/ώρα έναρξης της θέσης και μετά δεν θα μπορείτε να την διαγράψετε ή να την επεξεργαστείτε. Θέλετε να συνεχίσετε;";
    if (!window.confirm(confirmMessage)) return;

    setSubmitting(true);

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
      const response = await axios({
        method: "POST",
        url: `${API_BASE_URL}/api/positions`,
        data: payload,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      showToast({
        type: "success",
        message: "Η θέση άνοιξε με επιτυχία!"
      });
      setSubmitting(false);
      if (inModal && typeof onSuccess === "function") {
        onSuccess(response?.data);
        return;
      }
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
      showToast({ type: "error", message });
      setSubmitting(false);
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

  const wrapperClassName = inModal
    ? "w-full max-w-5xl mx-auto px-6"
    : "max-w-5xl mx-auto px-6 py-0 space-y-8";
  const formClassName = inModal
    ? "space-y-10 mt-4"
    : "space-y-10 bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-patras-albescentWhite-50";

  return (
    <div className={wrapperClassName}>
      {submitting && !inModal && (
        <div className="flex justify-center items-center">
          <LoadingIndicator size="sm" showText={false} />
          <span className="ml-2 text-patras-buccaneer">Υποβολή αίτησης...</span>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className={formClassName}
        noValidate
      >
        {/* BASIC INFO */}
        <section>

          <div className="grid grid-cols-1 gap-6">
            <PositionSelect
              positions={scientificFieldOptions}
              value={formData.scientificFieldId}
              onChange={handleScientificFieldSelect}
              label="Επιστημονικό πεδίο"
              placeholder="Αναζήτηστε με σχολή, τμήμα ή επιστημονικό πεδίο..."
              maxResults={50}
              error={showError("scientificFieldId") ? validationErrors.scientificFieldId : ""}
              disabled={inModal}
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

        {/* DATES */}
        <section>
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
        <div className="pt-6 border-t flex flex-wrap justify-end gap-3">
          {inModal && typeof onCancel === "function" && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 text-sm/6 font-medium rounded-lg hover:bg-gray-50"
            >
              Ακύρωση
            </button>
          )}
          <button
            type="submit"
            disabled={submitDisabled}
            aria-disabled={submitDisabled}
            className="px-6 py-2 bg-patras-buccaneer text-white text-sm/6 font-medium rounded-lg hover:bg-patras-sanguineBrown transition disabled:opacity-60"
          >
            {submitting ? "Άνοιγμα..." : "Άνοιγμα θέσης"}
          </button>
        </div>
      </form>
    </div>
  );
}
