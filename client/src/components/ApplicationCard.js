import React from "react";
import { Link } from "react-router-dom";

export default function ApplicationCard({ app, toDDMMYYYYHHMM }) {
  const endDate = app.positionEndDate || app.endDate || app.applicationEndDate || "";
  const endTime = app.positionEndTime || app.endTime || "";
  const firstSubmissionDate =
    app.firstSubmissionDate || app.submitDate || app.submittedAt || app.submissionDate || "";
  const lastResubmissionDate = app.lastResubmissionDate || app.resubmissionDate || "";
  const hasResubmission = Boolean(lastResubmissionDate);

  return (
    <div className="bg-white/95 border border-patras-buccaneer/40 rounded-lg px-4 py-3 shadow-sm transition-[transform,box-shadow] duration-200 hover:shadow-md hover:scale-[1.005] hover:bg-patras-albescentWhite/20">
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
          {hasResubmission ? (
            <>
              <div>
                Ημερομηνία 1ης υποβολής:{" "}
                <span className="text-sm font-semibold text-gray-700">
                  {firstSubmissionDate ? toDDMMYYYYHHMM(firstSubmissionDate) : "—"}
                </span>
              </div>
              <div>
                Ημερομηνία επανυποβολής:{" "}
                <span className="text-sm font-semibold text-gray-700">
                  {toDDMMYYYYHHMM(lastResubmissionDate)}
                </span>
              </div>
            </>
          ) : (
            <div>
              Ημερομηνία υποβολής:{" "}
              <span className="text-sm font-semibold text-gray-700">
                {firstSubmissionDate ? toDDMMYYYYHHMM(firstSubmissionDate) : "—"}
              </span>
            </div>
          )}
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
}
