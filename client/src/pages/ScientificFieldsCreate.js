import React, { useEffect, useMemo, useState } from "react";
import { useAuth, useCreatePositionValidation } from "../contexts";
import { useToast } from "../contexts/ToastContext";
import InputField from "../components/InputField";
import CustomSelect from "../components/CustomSelect";
import CoursePanel from "../components/CoursePanel";
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

export default function ScientificFieldsCreate() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { updateValidity, isValid, validationErrors } = useCreatePositionValidation();

  const [formData, setFormData] = useState({
    school: "select",
    department: "select",
    scientificField: "",
    courses: [],
  });

  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [redirectLoading, setRedirectLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const markTouched = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const showError = (field) => submitted || touched[field];
  const showCourseError = submitted || touched.courses;

  // access control
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") navigate("/home");
  }, [currentUser, navigate]);

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

    setSubmitting(true);

    const payload = {
      name: formData.scientificField,
      school: formData.school,
      department: formData.department,
      courses: JSON.stringify(formData.courses || []),
    };

    try {
      const token = localStorage.getItem("token");
      await axios({
        method: "POST",
        url: `${API_BASE_URL}/api/scientific-fields`,
        data: payload,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      showToast({
        type: "success",
        message: "Το επιστημονικό πεδίο δημιουργήθηκε με επιτυχία!",
      });
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
    <div className="max-w-5xl mx-auto px-6 py-0 space-y-8">
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
      <header className="text-center pb-2">
        <h1 className="text-2xl text-center border-b pb-2 text-gray-800">
          Δημιουργία πεδίου
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-10 bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-patras-albescentWhite-50"
      >
        {/* BASIC INFO */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-1">Βασικές πληροφορίες</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Επιστημονικό πεδίο"
              value={formData.scientificField}
              onChange={(val) => {
                markTouched("scientificField");
                setFormData((prev) => ({ ...prev, scientificField: val }));
              }}
              required
              error={showError("scientificField") ? validationErrors.scientificField : ""}
            />

            <div className="hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <CustomSelect
              label="Σχολή"
              value={formData.school}
              onChange={(val) => {
                markTouched("school");
                setFormData((prev) => ({ ...prev, school: val, department: "select" }));
              }}
              options={SCHOOLS.map((s) => ({ value: s, label: s }))}
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
          disabled={false}
          scientificFieldValue={formData.scientificField}
          errors={validationErrors}
        />
        {showCourseError && validationErrors.courses && (
          <p className="-mt-6 text-sm text-red-600">{validationErrors.courses}</p>
        )}

        {/* SUBMIT */}
        <div className="pt-6 border-t text-right">
          <button
            type="submit"
            disabled={submitDisabled}
            aria-disabled={submitDisabled}
            className="px-6 py-2 bg-patras-buccaneer text-white font-medium rounded-lg hover:bg-patras-sanguineBrown transition disabled:opacity-60"
          >
            {submitting ? "Δημιουργία..." : "Δημιουργία πεδίου"}
          </button>
        </div>
      </form>
    </div>
  );
}
