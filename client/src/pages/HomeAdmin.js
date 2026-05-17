import React from "react";
import HomePagePanel from "../components/HomePagePanel";

export default function HomeAdmin() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
          Καλώς ήρθατε, διαχειριστή
        </h1>
        <p className="text-gray-600 text-[17px]">
          Έχετε πλήρη πρόσβαση στο σύστημα διαχείρισης αιτήσεων
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HomePagePanel
          title="Θέσεις και επιστημονικά πεδία"
          description="Διαχειριστείτε θέσεις, επιστημονικά πεδία και μαθήματα."
          buttonText="Διαχείριση θέσεων και πεδίων"
          to="/positions-and-fields"
        />
        <HomePagePanel
          title="Χρήστες"
          description="Δείτε όλους τους χρήστες του συστήματος ή δημιουργήστε νέο διαχειριστή"
          buttonText="Διαχείριση χρηστών"
          to="/users"
        />
        <HomePagePanel
          title="Στατιστικά"
          description="Δείτε στατιστική ανάλυση αιτήσεων και αιτούντων βάσει διαφόρων κριτηρίων."
          buttonText="Δείτε στατιστικά"
          to="/analytics"
        />
        <HomePagePanel
          title="Γενική κατάταξη"
          description="Δείτε τη γενική κατάταξη όλων των αιτούντων σε όλα τα επιστημονικά πεδία."
          buttonText="Δείτε κατάταξη"
          to="/ranking"
          // showInfoMark={true}
          // infoPopup={rankingInfoPopup}
        />
      </div>
    </div>
  );
}
