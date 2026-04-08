import React from "react";
import HomePagePanel from "../components/HomePagePanel";

export default function Positions() {
  const positionsListPopup = (
    <>
      <span className="pb-2">Πίνακας Θέσεων</span>
      <ul className="space-y-1">
        <li>• Όλες οι θέσεις σε πίνακα με αναλυτικές πληροφορίες</li>
      </ul>
    </>
  );

  const createPositionPopup = (
    <>
      <span className="pb-2">Δημιουργία ή επεξεργασία θέσης</span>
      <ul className="space-y-1">
        <li>• Δημιουργήστε νέα θέση για το πρόγραμμα</li>
        <li>• Ορίστε επιστημονικό πεδίο, σχολή, τμήμα και προθεσμίες</li>
      </ul>
    </>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-0">
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
        Θέσεις προγράμματος
        </h1>
        <p className="text-gray-600 text-[17px]">
          Διαχειριστείτε τις θέσεις του προγράμματος, επεξεργαστείτε ή δημιουργήστε νέες θέσεις.
          <br />
          <span>Επιλέξτε μία από τις παρακάτω ενέργειες για να ξεκινήσετε.</span>
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <HomePagePanel
          title="Προβολή θέσεων"
          description="Δείτε όλες τις θέσεις (ενεργές και μη) σε έναν αναλυτικό πίνακα."
          buttonText="Όλες οι θέσεις"
          to="/positions/all"
          // showInfoMark={true}
          // infoPopup={positionsListPopup}
        />
        <HomePagePanel
          title="Δημιουργία θέσεων"
          description="Δημιουργήστε μια νέα θέση για το πρόγραμμα."
          buttonText="+ Νέα θέση"
          to="/positions/create"
          // showInfoMark={true}
          // infoPopup={createPositionPopup}
        />
        <HomePagePanel
          title="Επεξεργασία θέσεων"
          description="Επεξεργαστείτε τις προσεχείς θέσεις πριν την έναρξη της περιόδου αιτήσεων τους."
          buttonText="Επεξεργασία"
          to="/positions/edit"
          // showInfoMark={false}
        />
      </div>
    </div>
  );
}
