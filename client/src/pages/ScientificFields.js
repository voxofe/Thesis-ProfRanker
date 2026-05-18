import React from "react";
import HomePagePanel from "../components/HomePagePanel";

export default function ScientificFields() {
  return (
    <div className="max-w-4xl mx-auto p-0">
      <div className="mb-0">
        <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-800">
            Διαχείριση επιστημονικών πεδίων
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <HomePagePanel
          title="Προβολή επιστημονικών πεδίων"
          description="Δείτε ή επεξεργαστείτε όλα τα επιστημονικά πεδία και τα μαθήματα τους."
          buttonText="Δείτε όλα τα πεδία"
          to="/scientific-fields/view"
        />
        <HomePagePanel
          title="Δημιουργία επιστημονικού πεδίου"
          description="Δημιουργήστε νέο επιστημονικό πεδίο με τα αντίστοιχα μαθήματα."
          buttonText="+ Νέο πεδίο"
          to="/scientific-fields/create"
        />
      </div>
    </div>
  );
}
