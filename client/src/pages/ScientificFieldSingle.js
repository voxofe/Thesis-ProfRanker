import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import TooltipGray from "../components/TooltipGray";
import CourseDescriptionModal from "../components/CourseDescriptionModal";
import { formatDateTimeCell } from "../components/SortableTable";
import PositionCreate from "./PositionCreate";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

const stateLabels = {
  pending: "Προσεχής",
  active: "Ενεργή",
  completed: "Ολοκληρωμένη",
  unpublished: "Ανενεργή",
};

function getStateBadgeClasses(state) {
  const base =
    "inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold";
  if (state === "Ενεργή") return `${base} bg-yellow-100 text-yellow-800 border border-yellow-200`;
  if (state === "Ολοκληρωμένη") return `${base} bg-green-100 text-green-800 border border-green-200`;
  if (state === "Προσεχής") return `${base} bg-blue-100 text-blue-800 border border-blue-200`;
  if (state === "Ανενεργή") return `${base} bg-gray-100 text-gray-700 border border-gray-200`;
  return `${base} bg-gray-100 text-gray-700 border border-gray-200`;
}

export default function ScientificFieldSingle() {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [fieldData, setFieldData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [descriptionModal, setDescriptionModal] = useState({
    open: false,
    title: "",
    description: "",
  });

  const isAdmin = !!(
    currentUser?.isAdmin ||
    currentUser?.role === "admin" ||
    currentUser?.is_staff ||
    currentUser?.is_superuser
  );

  useEffect(() => {
    if (!id || !currentUser) return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE_URL}/api/scientific-fields/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setFieldData(res.data || null))
      .catch((err) => {
        console.error("Error fetching scientific field:", err);
        setError("Αποτυχία φόρτωσης δεδομένων.");
      })
      .finally(() => setLoading(false));
  }, [id, currentUser]);

  const refreshField = async () => {
    if (!id) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/scientific-fields/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setFieldData(res.data || null);
    } catch (err) {
      console.error("Error refreshing scientific field:", err);
    }
  };

  const fieldName = fieldData?.name || location.state?.scientificFieldName || "";
  const rankingLink = fieldName
    ? `/ranking?scientificField=${encodeURIComponent(fieldName)}`
    : "/ranking";
  const stateCode = fieldData?.state || "";
  const stateLabel = stateLabels[stateCode] || "—";
  const isPositionInactive = stateCode === "unpublished";
  const isPositionLocked = stateCode === "active" || stateCode === "completed";
  const positionButtonLabel = isPositionInactive
    ? "Άνοιγμα θέσης"
    : "Κλείσιμο θέσης";
  const positionButtonDisabled = !fieldData || isPositionLocked;
  const positionDisabledTooltip =
    "Δεν μπορείτε να κλείσετε θέση που έχει ανοίξει στους υποψήφιους.";
  const deleteButtonDisabled = !fieldData || deleting || isPositionLocked;
  const deleteDisabledTooltip =
    "Δεν μπορείτε να διαγράψετε θέση που έχει ανοίξει στους υποψηφίους.";
  const editButtonDisabled = !fieldData || isPositionLocked;
  const editDisabledTooltip =
    "Δεν μπορείτε να επεξεργαστείτε θέση που έχει ανοίξει στους υποψήφιους.";

  const courses = useMemo(() => {
    if (!Array.isArray(fieldData?.courses)) return [];
    return fieldData.courses.map((course) => ({
      ...course,
      teachingUnits: course.teachingUnits ?? course.teaching_units ?? "",
    }));
  }, [fieldData?.courses]);

  const handleEditClick = () => {
    if (!fieldData) return;
    navigate("/scientific-fields/create#edit", {
      state: { prefillScientificField: fieldData },
    });
  };

  const handleOpenPositionClick = async () => {
    if (!fieldData) return;
    if (isPositionInactive) {
      setPositionModalOpen(true);
      return;
    }

    const confirmed = window.confirm(
      "Θέλετε σίγουρα να κλείσετε τη θέση; Η ενέργεια θα διαγράψει τη θέση."
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token || !fieldData.positionId) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/positions/${fieldData.positionId}`,
        { headers: { Authorization: `Bearer ${token}` } });
      showToast({
        type: "success",
        message: "Η θέση έκλεισε με επιτυχία.",
      });
      await refreshField();
    } catch (err) {
      console.error("Error closing position:", err);
      const message = err?.response?.data?.error || "Αποτυχία κλεισίματος θέσης.";
      setError(message);
    }
  };

  const handleClosePositionModal = () => {
    setPositionModalOpen(false);
  };

  const handleDeleteClick = async () => {
    if (!id || deleting) return;
    const confirmed = window.confirm(
      "Θέλετε σίγουρα να διαγράψετε το επιστημονικό πεδίο; Η ενέργεια είναι οριστική."
    );
    if (!confirmed) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/scientific-fields/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast({
        type: "success",
        message: "Το επιστημονικό πεδίο διαγράφηκε με επιτυχία.",
      });
      navigate("/scientific-fields/view");
    } catch (err) {
      console.error("Error deleting scientific field:", err);
      setError("Αποτυχία διαγραφής επιστημονικού πεδίου.");
    } finally {
      setDeleting(false);
    }
  };

  const positionPrefill = useMemo(() => {
    if (!fieldData) return null;
    if (isPositionInactive) {
      return {
        scientificFieldId: fieldData.id || "",
      };
    }
    return {
      id: fieldData.positionId || "",
      scientificFieldId: fieldData.id || "",
      startDate: fieldData.positionStartDate || "",
      endDate: fieldData.positionEndDate || "",
      startTime: fieldData.positionStartTime || "00:00",
      endTime: fieldData.positionEndTime || "23:59",
    };
  }, [fieldData, isPositionInactive]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-y-5 pt-5">
        <p className="text-center text-gray-600">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-0 space-y-6 pb-10">
      <h1 className="text-2xl text-center border-b pb-2 text-gray-800">
        {fieldName ? (
          <>
            Επιστημονικό πεδίο: <span className="text-lg font-semibold">{fieldName}</span>
          </>
        ) : (
          "Επιστημονικό πεδίο"
        )}
      </h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {positionModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6 py-8"
            onClick={handleClosePositionModal}
          >
            <div
              className="relative z-[9999] w-full max-w-[700px] max-h-[86vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white px-8 pt-8 pb-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleClosePositionModal}
                className="absolute right-6 top-5 z-10 text-3xl leading-none text-gray-600 hover:text-gray-900"
                aria-label="Κλείσιμο"
                title="Κλείσιμο"
              >
                &times;
              </button>

              <div
                className="
                    mx-auto w-full max-w-[620px]
                  [&_hr]:hidden
                  [&_.border-t]:border-t-0
                  [&_.border-b]:border-b-0
                  [&_form]:space-y-10
                  [&_form>div:last-child]:mt-4
                  [&_form>div:last-child]:pt-0
                  [&_form>div:last-child]:border-t-0
                  [&_button[type='submit']]:mt-0
                "
              >
                <PositionCreate
                  prefillPosition={positionPrefill}
                  inModal
                  onCancel={handleClosePositionModal}
                  onSuccess={async () => {
                    setPositionModalOpen(false);
                    await refreshField();
                    navigate(`/scientific-fields/view/${id}`);
                  }}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h2 className="text-xl font-light mb-3">Στοιχεία επιστημονικού πεδίου</h2>
          <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50">
            <table className="min-w-full bg-white/40">
              <thead className="bg-patras-buccaneer">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    Όνομα
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    Σχολή
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Τμήμα
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-patras-cameo">
                <tr>
                  <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle border-r border-patras-albescentWhite font-semibold">
                    {fieldName || "—"}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle border-r border-patras-albescentWhite">
                    {fieldData?.school || "—"}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle">
                    {fieldData?.department || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-light">Μαθήματα</h2>
          </div>

          {courses.length ? (
            <div className="w-full overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50">
              <table className="min-w-full bg-white/40">
                <thead className="bg-patras-buccaneer">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Κωδικός
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Όνομα
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Περιγραφή
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Εξάμηνο
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Μονάδες
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      ECTS
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Θεωρία
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                      Εργαστήριο
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Κατηγορία
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-patras-cameo">
                  {courses.map((course) => (
                    <tr key={course.id || course.code}>
                      <td className="px-4 py-3 text-center text-patras-buccaneer text-sm border-r border-patras-albescentWhite">
                        {course.code || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-patras-buccaneer text-sm border-r border-patras-albescentWhite font-semibold">
                        {course.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-patras-buccaneer text-sm border-r border-patras-albescentWhite">
                        {course.description ? (
                          <button
                            type="button"
                            onClick={() =>
                              setDescriptionModal({
                                open: true,
                                title: course.name ? `Περιγραφή μαθήματος: ${course.name}` : "Περιγραφή μαθήματος",
                                description: course.description,
                              })
                            }
                            className="underline text-patras-buccaneer hover:text-patras-sanguineBrown"
                          >
                            Περιγραφή
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-patras-buccaneer text-sm border-r border-patras-albescentWhite">
                        {course.semester || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-patras-buccaneer text-sm border-r border-patras-albescentWhite">
                        {course.teachingUnits || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-patras-buccaneer text-sm border-r border-patras-albescentWhite">
                        {course.ects || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-patras-buccaneer text-sm border-r border-patras-albescentWhite">
                        {course.theory_hours ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-patras-buccaneer text-sm border-r border-patras-albescentWhite">
                        {course.lab_hours ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-patras-buccaneer text-sm">
                        {course.category || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Δεν υπάρχουν διαθέσιμα μαθήματα.</p>
          )}
        </div>

        <CourseDescriptionModal
          open={descriptionModal.open}
          title={descriptionModal.title}
          description={descriptionModal.description}
          onClose={() =>
            setDescriptionModal({
              open: false,
              title: "",
              description: "",
            })
          }
        />

        <div>
          <h2 className="text-xl font-light mb-3">Στοιχεία θέσης</h2>
          <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50">
            <table className="min-w-full bg-white/40">
              <thead className="bg-patras-buccaneer">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    Έναρξη
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    Λήξη
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                    Κατάσταση
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Αιτήσεις
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-patras-cameo">
                <tr>
                  <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                    {formatDateTimeCell(fieldData?.positionStartDate, fieldData?.positionStartTime, "00:00")}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                    {formatDateTimeCell(fieldData?.positionEndDate, fieldData?.positionEndTime, "23:59")}
                  </td>
                  <td className="px-6 py-4 text-patras-buccaneer text-sm text-center align-middle border-r border-patras-albescentWhite">
                    <span className={getStateBadgeClasses(stateLabel)}>{stateLabel}</span>
                  </td>
                  <td className="p-0 text-patras-buccaneer text-sm text-center align-middle">
                    {fieldData?.applications !== undefined && fieldData?.applications !== null ? (
                      <Link
                        to={rankingLink}
                        className="group flex h-full w-full flex-col items-center justify-center py-4 font-semibold text-patras-buccaneer transition hover:bg-patras-buccaneer/10 hover:text-patras-sanguineBrown focus:outline-none focus-visible:ring-2 focus-visible:ring-patras-buccaneer"
                        title={fieldName ? `Δείτε αιτήσεις για ${fieldName}` : "Δείτε αιτήσεις"}
                        aria-label={fieldName ? `Δείτε αιτήσεις για ${fieldName}` : "Δείτε αιτήσεις"}
                      >
                        <span className="text-base">{fieldData.applications}</span>
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {isAdmin && (
            <div className="mt-8 flex items-center justify-end gap-2">
              {isPositionLocked ? (
                <TooltipGray content={positionDisabledTooltip}>
                  <button
                    type="button"
                    onClick={handleOpenPositionClick}
                    disabled={positionButtonDisabled}
                    className="inline-flex items-center justify-center rounded-md border border-patras-buccaneer px-4 py-2 text-sm font-medium text-patras-buccaneer transition-colors hover:bg-patras-buccaneer hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {positionButtonLabel}
                  </button>
                </TooltipGray>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenPositionClick}
                  disabled={positionButtonDisabled}
                  className="inline-flex items-center justify-center rounded-md border border-patras-buccaneer px-4 py-2 text-sm font-medium text-patras-buccaneer transition-colors hover:bg-patras-buccaneer hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {positionButtonLabel}
                </button>
              )}
              {isPositionLocked ? (
                <TooltipGray content={editDisabledTooltip}>
                  <button
                    type="button"
                    onClick={handleEditClick}
                    disabled={editButtonDisabled}
                    className="inline-flex items-center justify-center rounded-md bg-patras-buccaneer px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-patras-sanguineBrown disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Επεξεργασία
                  </button>
                </TooltipGray>
              ) : (
                <button
                  type="button"
                  onClick={handleEditClick}
                  disabled={editButtonDisabled}
                  className="inline-flex items-center justify-center rounded-md bg-patras-buccaneer px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-patras-sanguineBrown disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Επεξεργασία
                </button>
              )}
              {isPositionLocked ? (
                <TooltipGray content={deleteDisabledTooltip}>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={deleteButtonDisabled}
                    className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Διαγραφή
                  </button>
                </TooltipGray>
              ) : (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={deleteButtonDisabled}
                  className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Διαγραφή
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
