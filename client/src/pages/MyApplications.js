import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

export default function MyApplications() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [headerName, setHeaderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [activeOpen, setActiveOpen] = useState(true);
  const [completedOpen, setCompletedOpen] = useState(false);

  const isAdminViewing = currentUser?.role === "admin" && userId;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const url = isAdminViewing
      ? `${API_BASE_URL}/api/admin/profile/${userId}`
      : `${API_BASE_URL}/api/profile`;
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (isAdminViewing) {
          const firstName = res.data?.user?.firstName || "";
          const lastName = res.data?.user?.lastName || "";
          setHeaderName(`${firstName} ${lastName}`.trim());
        } else {
          setHeaderName("");
        }
        const apps = Array.isArray(res.data?.applications)
          ? res.data.applications
          : [];
        setApplications(apps);
      })
      .catch((error) => {
        console.error("Error loading applications:", error);
      })
      .finally(() => setLoading(false));
  }, [userId, isAdminViewing]);

  const parseDDMMYYYYToDate = (value, timeValue) => {
    if (!value) return null;
    const match = String(value).match(/^(\d{2})-(\d{2})-(\d{4})/);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    const [hh, min] = String(timeValue || "00:00").split(":");
    return new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh || 0),
      Number(min || 0)
    );
  };

  const isPositionActive = (startDate, startTime, endDate, endTime, explicitFlag) => {
    if (typeof explicitFlag === "boolean") return explicitFlag;
    const now = new Date();
    const start = parseDDMMYYYYToDate(startDate, startTime);
    const end = parseDDMMYYYYToDate(endDate, endTime);
    if (start && end) return now >= start && now <= end;
    if (end) return now <= end;
    return false;
  };

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      const dateA = a.submitDate || "";
      const dateB = b.submitDate || "";
      return dateB.localeCompare(dateA);
    });
  }, [applications]);

  const { activeApplications, completedApplications } = useMemo(() => {
    const active = [];
    const completed = [];
    sortedApplications.forEach((app) => {
      const endDate = app.positionEndDate || app.endDate || app.applicationEndDate || "";
      const endTime = app.positionEndTime || app.endTime || "";
      const startDate = app.positionStartDate || app.startDate || "";
      const startTime = app.positionStartTime || app.startTime || "";
      const isActive = isPositionActive(startDate, startTime, endDate, endTime, app.isActive);
      if (isActive) {
        active.push(app);
      } else {
        completed.push(app);
      }
    });
    return { activeApplications: active, completedApplications: completed };
  }, [sortedApplications]);

  const toDDMMYYYY = (v) => {
    if (!v) return "";
    if (typeof v === "string") {
      const m = v.match(/^(\d{2})-(\d{2})-(\d{4})/);
      if (m) return `${m[1]}-${m[2]}-${m[3]}`;
      const d = new Date(v);
      if (!isNaN(d)) {
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      }
      return v;
    }
    if (v instanceof Date && !isNaN(v)) {
      const dd = String(v.getDate()).padStart(2, "0");
      const mm = String(v.getMonth() + 1).padStart(2, "0");
      const yyyy = v.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    return "—";
  };

  const toDDMMYYYYHHMM = (dateStr, timeStr) => {
    if (!dateStr) return "";
    const base = toDDMMYYYY(dateStr);
    const embeddedTime = typeof dateStr === "string" ? dateStr.match(/\b(\d{2}:\d{2})\b/)?.[1] : "";
    const rawTime = timeStr || embeddedTime || "00:00";
    const [hh, mm] = String(rawTime).split(":");
    const padded = `${String(hh || "0").padStart(2, "0")}:${String(mm || "0").padStart(2, "0")}`;
    return `${base} ${padded}`;
  };


  const handleDelete = async (applicationId) => {
    if (!applicationId || deletingId) return;
    const confirmed = window.confirm("Θέλετε σίγουρα να διαγράψετε αυτή την αίτηση;");
    if (!confirmed) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setDeletingId(applicationId);
    try {
      await axios.delete(`${API_BASE_URL}/api/applications/${applicationId}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    } catch (error) {
      console.error("Error deleting application:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-y-5 pt-5">
        <p className="text-center text-gray-600">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6 sm:pt-0 sm:pb-8">
        <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-800">
          {isAdminViewing ? (
            <>
              Αιτήσεις χρήστη: <span className="text-lg font-semibold">{headerName}</span>
            </>
          ) : (
            "Οι αιτήσεις μου"
          )}
        </h1>

        {sortedApplications.length === 0 ? (
          <div className="bg-white/85 rounded-lg border border-gray-200 shadow-sm p-6 text-center">
            <p className="text-gray-700 font-semibold">Δεν υπάρχουν καταχωρημένες αιτήσεις.</p>
            <p className="text-sm text-gray-500 mt-2">
              Μόλις υποβάλετε, θα εμφανίζονται εδώ με αναλυτικές πληροφορίες.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            <div className="bg-white/80 border border-gray-200 rounded-lg shadow-sm">
              <button
                type="button"
                onClick={() => setActiveOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-patras-buccaneer font-semibold"
              >
                <span>Ενεργές</span>
                <span className="text-lg">{activeOpen ? "▼" : "\u25B6\uFE0E"}</span>
              </button>
              {activeOpen && (
                <div className="px-4 pb-4 grid grid-cols-1 gap-3">
                  {activeApplications.length === 0 ? (
                    <div className="text-sm text-gray-500">Δεν υπάρχουν ενεργές αιτήσεις.</div>
                  ) : (
                    activeApplications.map((app) => {
                      const endDate = app.positionEndDate || app.endDate || app.applicationEndDate || "";
                      const endTime = app.positionEndTime || app.endTime || "";
                      const submitDate = app.submitDate || app.submittedAt || app.submissionDate || "";

                      return (
                        <div
                          key={app.id}
                          className="bg-white/95 border border-gray-200 rounded-lg px-4 py-3 shadow-sm transition-[transform,box-shadow] duration-200 hover:shadow-md hover:scale-[1.005] hover:bg-patras-albescentWhite/20"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-1">
                              <h2 className="text-base font-semibold text-patras-buccaneer">
                                {app.scientificField || "—"}
                              </h2>
                              <p className="text-sm text-gray-600">
                                {app.school || "—"} · {app.department || "—"}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>
                                Ημερομηνία υποβολής:{" "}
                                <span className="text-sm font-semibold text-gray-700">
                                  {submitDate ? toDDMMYYYYHHMM(submitDate) : "—"}
                                </span>
                              </div>
                              <div>
                                Ημερομηνία λήξης αιτήσεων:{" "}
                                <span className="text-sm font-semibold text-gray-700">
                                  {endDate ? toDDMMYYYYHHMM(endDate, endTime) : "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-sm text-gray-700">
                              Μόρια: <span className="font-semibold">{app.totalPoints ?? "—"}</span>
                            </div>
                            <Link
                              to={`/application-score/${app.id}`}
                              className="inline-flex items-center justify-center bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors"
                            >
                              Προβολή αίτησης
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="bg-white/80 border border-gray-200 rounded-lg shadow-sm">
              <button
                type="button"
                onClick={() => setCompletedOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-patras-buccaneer font-semibold"
              >
                <span>Ολοκληρωμένες</span>
                <span className="text-lg">{completedOpen ? "▼" : "\u25B6\uFE0E"}</span>
              </button>
              {completedOpen && (
                <div className="px-4 pb-4 grid grid-cols-1 gap-3">
                  {completedApplications.length === 0 ? (
                    <div className="text-sm text-gray-500">Δεν υπάρχουν ολοκληρωμένες αιτήσεις.</div>
                  ) : (
                    completedApplications.map((app) => {
                      const endDate = app.positionEndDate || app.endDate || app.applicationEndDate || "";
                      const endTime = app.positionEndTime || app.endTime || "";
                      const submitDate = app.submitDate || app.submittedAt || app.submissionDate || "";

                      return (
                        <div
                          key={app.id}
                          className="bg-white/95 border border-gray-200 rounded-lg px-4 py-3 shadow-sm transition-[transform,box-shadow] duration-200 hover:shadow-md hover:scale-[1.005] hover:bg-patras-albescentWhite/20"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-1">
                              <h2 className="text-base font-semibold text-patras-buccaneer">
                                {app.scientificField || "—"}
                              </h2>
                              <p className="text-sm text-gray-600">
                                {app.school || "—"} · {app.department || "—"}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>
                                Ημερομηνία υποβολής:{" "}
                                <span className="text-sm font-semibold text-gray-700">
                                  {submitDate ? toDDMMYYYYHHMM(submitDate) : "—"}
                                </span>
                              </div>
                              <div>
                                Ημερομηνία λήξης αιτήσεων:{" "}
                                <span className="text-sm font-semibold text-gray-700">
                                  {endDate ? toDDMMYYYYHHMM(endDate, endTime) : "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-sm text-gray-700">
                              Μόρια: <span className="font-semibold">{app.totalPoints ?? "—"}</span>
                            </div>
                            <Link
                              to={`/application-score/${app.id}`}
                              className="inline-flex items-center justify-center bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors"
                            >
                              Προβολή αίτησης
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
