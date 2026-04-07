import React from "react";
import HomePagePanel from "../components/HomePagePanel";

export default function ScientificFields() {
  const scientificFieldsListPopup = (
    <>
      <span className="pb-2">Πίνακας Επιστημονικών Πεδίων</span>
      <ul className="space-y-1">
        <li>• Όλα τα επιστημονικά πεδία σε έναν αναλυτικό πίνακα</li>
      </ul>
    </>
  );

  const scientificFieldsCreatePopup = (
    <>
      <span className="pb-2">Δημιουργία Επιστημονικού Πεδίου</span>
      <ul className="space-y-1">
        <li>• Καταχωρήστε νέο πεδίο</li>
        <li>• Ορίστε τμήμα, σχολή και μαθήματα</li>
      </ul>
    </>
  );

  const scientificFieldsEditPopup = (
    <>
      <span className="pb-2">Επεξεργασία Επιστημονικών Πεδίων</span>
      <ul className="space-y-1">
        <li>• Ενημερώστε τα στοιχεία των πεδίων</li>
        <li>• Προσθέστε ή αφαιρέστε μαθήματα</li>
      </ul>
    </>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-0">
        <p className="text-gray-600 text-[17px]">
          Διαχειριστείτε τα επιστημονικά πεδία και τα μαθήματά τους. Επιλέξτε μία από τις παρακάτω ενέργειες για να συνεχίσετε.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <HomePagePanel
          title="Προβολή Πεδίων"
          description="Δείτε όλα τα επιστημονικά πεδία σε έναν αναλυτικό πίνακα."
          buttonText="Όλα τα Πεδία"
          to="/scientific-fields/all"
          // showInfoMark={true}
          // infoPopup={scientificFieldsListPopup}
        />
        <HomePagePanel
          title="Δημιουργία Πεδίου"
          description="Δημιουργήστε νέο επιστημονικό πεδίο με τα αντίστοιχα μαθήματα."
          buttonText="+ Νέο Πεδίο"
          to="/scientific-fields/create"
          // showInfoMark={true}
          // infoPopup={scientificFieldsCreatePopup}
        />
        <HomePagePanel
          title="Επεξεργασία Πεδίου"
          description="Επεξεργαστείτε υπάρχοντα επιστημονικά πεδία και μαθήματα."
          buttonText="Επεξεργασία"
          to="/scientific-fields/edit"
          // showInfoMark={true}
          // infoPopup={scientificFieldsEditPopup}
        />
      </div>
    </div>
  );
}
