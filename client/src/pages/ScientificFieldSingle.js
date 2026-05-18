import React from "react";
import { useLocation } from "react-router-dom";

export default function ScientificFieldSingle() {
  const location = useLocation();
  const fieldName = location.state?.scientificFieldName || "";

  return (
    <div className="max-w-4xl mx-auto p-0">
      <h1 className="text-2xl text-center border-b  pb-2 mb-6 text-gray-800">
        {fieldName ? (
          <>
            Επιστημονικό πεδίο: <span className="text-lg font-semibold">{fieldName}</span>
          </>
        ) : (
          "Επιστημονικό πεδίο"
        )}
      </h1>
      <p className="text-gray-600 text-[17px]">
        Placeholder σελιδα για προβολη και επεξεργασια.
      </p>
    </div>
  );
}
