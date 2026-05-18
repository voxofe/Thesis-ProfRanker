import React from "react";
import HomePagePanel from "../components/HomePagePanel";

export default function PositionsAndFields() {
  return (
    <div className="max-w-4xl mx-auto p-0">
      <div className="mb-0">
        <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-800">
            Επιστημονικά πεδία και μαθήματα
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <HomePagePanel
          title="Θέσεις"
          description="Δείτε/επεξεργαστείτε όλες τις θέσεις ή δημιουργείστε μία νέα."
          buttonText="Διαχείριση θέσεων"
          to="/positions"
        />
        <HomePagePanel
          title="Επιστημονικά πεδία"
          description="Διαχειριστείτε τα επιστημονικά πεδία, τα μαθήματα και τις πληροφορίες τους."
          buttonText="Διαχείριση πεδίων"
          to="/scientific-fields"
        />
      </div>
    </div>
  );
}
