import React, { useEffect, useMemo, useState } from "react";
import { useAuth, usePositions, useCreatePositionValidation } from "../contexts";
import InputField from "../components/InputField";
import CustomSelect from "../components/CustomSelect";
import CoursePanel from "../components/CoursePanel";
import FlowbiteDateField from "../components/FlowbiteDateField";
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

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function CreatePosition() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { positions } = usePositions();
  const { updateValidity, isValid } = useCreatePositionValidation();

  const [formData, setFormData] = useState({
    school: "select",
    department: "select",
    scientificField: "select",
    startDate: "",
    endDate: "",
    courses: [],
  });

  const [isNewSciField, setIsNewSciField] = useState(false);
  const [newSciFieldName, setNewSciFieldName] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

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

  // SF selection
  const handleScientificFieldChange = (val) => {
    if (val === "select") {
      setIsNewSciField(false);
      setFormData((prev) => ({
        ...prev,
        scientificField: "select",
        school: "select",
        department: "select",
        courses: [],
      }));
    } else if (val === "__new__") {
      setIsNewSciField(true);
      setFormData((prev) => ({
        ...prev,
        scientificField: "",
        school: "select",
        department: "select",
        courses: [],
      }));
    } else {
      const matched = positions.find((p) => p.scientificField === val);
      setIsNewSciField(false);
      setFormData((prev) => ({
        ...prev,
        scientificField: val,
        school: matched?.school || "select",
        department: matched?.department || "select",
        courses: matched?.courses || [],
      }));
    }
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
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = updateValidity({ ...formData, newSciFieldName: newSciFieldName.trim() }, isNewSciField);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setNotification({ message: "", type: "" });

    setTimeout(() => {
      setSubmitting(false);
      setNotification({ message: "Η θέση δημιουργήθηκε με επιτυχία!", type: "success" });
    }, 1200);
  };

  const isSFSelected = formData.scientificField && !isNewSciField;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-semibold text-gray-800">Δημιουργία Θέσης</h1>
        <p className="text-gray-500 mt-1 text-sm">Ορίστε τα στοιχεία της νέας θέσης και τα μαθήματα της</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-10 bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-patras-albescentWhite-50"
      >
        {/* BASIC INFO */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-1">Βασικές Πληροφορίες</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomSelect
              label="Επιστημονικό Πεδίο"
              value={isNewSciField ? "__new__" : formData.scientificField}
              onChange={handleScientificFieldChange}
              options={[
                { value: "__new__", label: "+ Νέο επιστημονικό πεδίο" },
                ...positions
                  .map((p) => p.scientificField)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map((sf) => ({ value: sf, label: sf }))
                  .sort((a, b) => a.label.localeCompare(b.label)),
              ]}
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
              popupAlign="right"
              required
            />
            <FlowbiteDateField
              label="Ημερομηνία Λήξης"
              value={formData.endDate}
              onChange={(val) => setFormData({ ...formData, endDate: val })}
              minDate={todayISO()}
              popupAlign="right"
              required
            />
          </div>
        </section>

        {/* SUBMIT */}
        <div className="pt-6 border-t text-right">
          <button
            type="submit"
            disabled={submitting || !isValid}
            className="px-6 py-2 bg-patras-buccaneer text-white font-medium rounded-lg hover:bg-patras-sanguineBrown transition disabled:opacity-60"
          >
            {submitting ? "Δημιουργία..." : "Δημιουργία Θέσης"}
          </button>

          {notification.message && (
            <p
              className={`mt-3 text-sm font-medium ${
                notification.type === "success" ? "text-green-600" : "text-red-600"
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
