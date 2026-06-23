import React from "react";
import { useAuth } from "../contexts/AuthContext";
import HomeAdmin from "./HomeAdmin";
import HomeApplicant from "./HomeApplicant";

export default function Home() {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role;

  if (userRole === "admin") {
    return <HomeAdmin />;
  }

  if (userRole === "applicant" || userRole === "guest") {
    return <HomeApplicant />;
  }

  // Fallback content
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-50 dark:bg-[var(--color-bg-muted)] border border-gray-200 dark:border-[var(--color-border)] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-600 dark:text-[var(--color-text-secondary)] mb-3">
          Καλώς ήρθατε
        </h2>
        <p className="text-gray-600 dark:text-[var(--color-text-secondary)]">Παρακαλώ συνδεθείτε για να συνεχίσετε.</p>
      </div>
    </div>
  );
}
