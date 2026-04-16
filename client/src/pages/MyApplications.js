import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const apps = Array.isArray(res.data?.applications)
          ? res.data.applications
          : [];
        setApplications(apps);
      })
      .catch((error) => {
        console.error("Error loading applications:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      const dateA = a.submitDate || "";
      const dateB = b.submitDate || "";
      return dateB.localeCompare(dateA);
    });
  }, [applications]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-y-5 pt-5">
        <p className="text-center text-gray-600">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-0">
        <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-800">
            Οι αιτήσεις μου
        </h1>

      {sortedApplications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <p className="text-gray-500">Δεν υπάρχουν καταχωρημένες αιτήσεις.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-patras-buccaneer">
                    {app.scientificField || "—"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {app.school || "—"} · {app.department || "—"}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  {app.submitDate || "—"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
          ))}
        </div>
      )}
    </div>
  );
}
