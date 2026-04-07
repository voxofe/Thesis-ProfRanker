import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth, usePositions, useCreatePositionValidation } from "../contexts";
import InputField from "../components/InputField";
import CustomSelect from "../components/CustomSelect";
import CoursePanel from "../components/CoursePanel";
import FlowbiteDateField from "../components/FlowbiteDateField";
import Tooltip from "../components/Tooltip";
import PositionSelect from "../components/PositionSelect";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function CreatePosition() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { positions } = usePositions();
  const { updateValidity, isValid, validationErrors } = useCreatePositionValidation();

  const [formData, setFormData] = useState({
    school: "select",
    department: "select",
    scientificField: "select",
    startDate: "",
    endDate: "",
    startTime: "00:00",
    endTime: "23:59",
    courses: [],
  });

  const [isNewSciField, setIsNewSciField] = useState(false);
  const [newSciFieldName, setNewSciFieldName] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [redirectLoading, setRedirectLoading] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const submitButtonRef = useRef(null);
  const [openSubmitTip, setOpenSubmitTip] = useState(false);

  // access control
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") navigate("/home");
  }, [currentUser, navigate]);

  // LIVE validation – run on any edit; do NOT depend on updateValidity
  useEffect(() => {
    updateValidity(
      { ...formData, newSciFieldName: newSciFieldName.trim() },
      isNewSciField
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, newSciFieldName, isNewSciField]);

  const inactivePositions = useMemo(
    () => (positions || []).filter((p) => p?.state === "completed"),
    [positions]
  );

  const positionOptions = useMemo(
    () => [
      { id: "__new__", label: "+ Νέο επιστημονικό πεδίο", __isExtra: true },
      ...inactivePositions,
    ],
    [inactivePositions]
  );

  // SF selection via PositionSelect
  const handleScientificFieldSelect = (val) => {
    if (!val) {
      setIsNewSciField(false);
      setSelectedPositionId("");
      setFormData((prev) => ({
        ...prev,
        scientificField: "select",
        school: "select",
        department: "select",
        courses: [],
      }));
      return;
    }

    if (val === "__new__") {
      setIsNewSciField(true);
      setSelectedPositionId("__new__");
      setFormData((prev) => ({
        ...prev,
        scientificField: "",
        school: "select",
        department: "select",
        courses: [],
      }));
      return;
    }

    const matched = inactivePositions.find((p) => String(p.id) === String(val));
    setIsNewSciField(false);
    setSelectedPositionId(String(val));
    setFormData((prev) => ({
      ...prev,
      scientificField: matched?.scientificField || "select",
      school: matched?.school || "select",
      department: matched?.department || "select",
      courses: matched?.courses || [],
    }));
  };

  // department options
  const departmentOptions = useMemo(() => {
    const deps = formData.school && formData.school !== "select"
      ? DEPARTMENTS[formData.school] || []
      : Object.values(DEPARTMENTS).flat();
    return deps.sort((a, b) => a.localeCompare(b, "el"));
  }, [formData.school]);

  // course handlers
  const handleCourseChange = (idx, field, value) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    }));
  };

  const addCourse = () =>
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

  const removeCourse = (idx) =>
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== idx),
    }));

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = updateValidity({ ...formData, newSciFieldName: newSciFieldName.trim() }, isNewSciField);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setNotification({ message: "", type: "" });

    const payload = {
      isNewSciField,
      scientificField: formData.scientificField,
      newSciFieldName: newSciFieldName.trim(),
      school: formData.school,
      department: formData.department,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      courses: JSON.stringify(formData.courses || []),
    };

    try {
      const token = localStorage.getItem("token");
      await axios({
        method: "POST",
        url: `${API_BASE_URL}/api/positions/create`,
        data: payload,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setNotification({ message: "Η θέση δημιουργήθηκε με επιτυχία!", type: "success" });
      setSubmitting(false);
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

  const isSFSelected = formData.scientificField && !isNewSciField;
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
        <h1 className="text-3xl font-semibold text-gray-800">Δημιουργία Θέσης</h1>
        <p className="text-gray-500 mt-1 text-sm">Ορίστε τα στοιχεία της νέας θέσης και τα μαθήματα της</p>
      </header>

      <p className="text-sm text-gray-600 -mt-2 mb-2">
        <span className="text-red-600">*</span> Τα πεδία με αστερίσκο είναι υποχρεωτικά
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-10 bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-patras-albescentWhite-50"
      >
        {/* BASIC INFO */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-1">Βασικές Πληροφορίες</h2>

          <div className={`grid grid-cols-1 ${isNewSciField ? "md:grid-cols-2" : ""} gap-6`}>
            <PositionSelect
              positions={positionOptions}
              value={isNewSciField ? "__new__" : selectedPositionId}
              onChange={handleScientificFieldSelect}
              label="Επιστημονικό Πεδίο"
              placeholder="Αναζήτηστε με σχολή, τμήμα ή επιστημονικό πεδίο..."
              maxResults={50}
              required
            />

            {isNewSciField && (
              <InputField
                label="Όνομα νέου Επιστημονικού Πεδίου"
                value={newSciFieldName}
                onChange={setNewSciFieldName}
                required
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <CustomSelect
              label="Σχολή"
              value={formData.school}
              onChange={(val) => setFormData((prev) => ({ ...prev, school: val, department: "select" }))}
              options={SCHOOLS.map((s) => ({ value: s, label: s }))}
              disabled={!isNewSciField}
              required
            />

            <CustomSelect
              label="Τμήμα"
              value={formData.department}
              onChange={(val) =>
                setFormData((prev) => {
                  const updated = { ...prev, department: val };
                  if (isNewSciField && val !== "select") {
                    const found = Object.entries(DEPARTMENTS).find(([school, deps]) => deps.includes(val));
                    if (found) updated.school = found[0];
                  }
                  return updated;
                })
              }
              options={departmentOptions.map((d) => ({ value: d, label: d }))}
              disabled={!isNewSciField}
              required
            />
          </div>
        </section>

        {/* COURSES */}
        <CoursePanel
          courses={formData.courses}
          onCourseChange={handleCourseChange}
          onAddCourse={addCourse}
          onRemoveCourse={removeCourse}
          isNewSciField={isNewSciField}
          disabled={isSFSelected}
          scientificFieldValue={formData.scientificField}
          errors={validationErrors}
        />

        {/* DATES */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-1">Ημερομηνίες</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FlowbiteDateField
              label="Ημερομηνία Έναρξης"
              value={formData.startDate}
              onChange={(val) => setFormData({ ...formData, startDate: val })}
              minDate={todayISO()}
              maxDate={formData.endDate || undefined}
              popupAlign="right"
              required
            />
            <FlowbiteDateField
              label="Ημερομηνία Λήξης"
              value={formData.endDate}
              onChange={(val) => setFormData({ ...formData, endDate: val })}
              minDate={formData.startDate || todayISO()}
              popupAlign="right"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <InputField
              label="Ώρα Έναρξης"
              type="time"
              value={formData.startTime}
              onChange={(val) => setFormData({ ...formData, startTime: val })}
              required
            />
            <InputField
              label="Ώρα Λήξης"
              type="time"
              value={formData.endTime}
              onChange={(val) => setFormData({ ...formData, endTime: val })}
              required
            />
          </div>

          {validationErrors?.dateTimeRange && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.dateTimeRange}</p>
          )}
        </section>

        {/* SUBMIT */}
        <div className="pt-6 border-t text-right">
          <span
            className="inline-block"
            ref={submitButtonRef}
            onMouseEnter={() => submitDisabled && setOpenSubmitTip(true)}
            onMouseLeave={() => setOpenSubmitTip(false)}
            onFocus={() => submitDisabled && setOpenSubmitTip(true)}
            onBlur={() => setOpenSubmitTip(false)}
          >
            <button
              type="submit"
              disabled={submitDisabled}
              aria-disabled={submitDisabled}
              className="px-6 py-2 bg-patras-buccaneer text-white font-medium rounded-lg hover:bg-patras-sanguineBrown transition disabled:opacity-60"
            >
              {submitting ? "Δημιουργία..." : "Δημιουργία Θέσης"}
            </button>
            <Tooltip
              anchorRef={submitButtonRef}
              open={openSubmitTip && submitDisabled}
              placement="top-left"
              className="bg-white border border-patras-buccaneer text-patras-buccaneer text-xs px-2 py-1 rounded-lg shadow-lg whitespace-nowrap min-w-max"
            >
              Συμπληρώστε όλα τα υποχρεωτικά πεδία για να συνεχίσετε
            </Tooltip>
          </span>

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
