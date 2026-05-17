import React from "react";
import HomePagePanel from "../components/HomePagePanel";

export default function PositionsAndFields() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-0">
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
          Θέσεις και επιστημονικά πεδία
        </h1>
        <p className="text-gray-600 text-[17px]">
          Διαχειριστείτε θέσεις, επιστημονικά πεδία και μαθήματα.
          <br />
          <span>Επιλέξτε μία από τις παρακάτω ενέργειες για να ξεκινήσετε.</span>
        </p>
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
