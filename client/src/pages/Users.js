import React from "react";
import HomePagePanel from "../components/HomePagePanel";

export default function Users() {
  return (
    <div className="max-w-4xl mx-auto p-0">
        <h1 className="text-2xl text-center border-b pb-2 mb-6 text-gray-800">
            Διαχείριση χρηστών
        </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <HomePagePanel
          title="Δείτε χρήστες"
          description="Δείτε λίστα με όλους τους χρήστες του συστημάτος και τους ρόλους τους."
          buttonText="Προβολή λίστας"
          to="/users/view"
        />
        <HomePagePanel
          title="Προσθήκη διαχειριστών"
          description="Δημιουργήστε νέο λογαριασμό διαχειριστή με ειδικά δικαιώματα."
          buttonText="Δημιουργία διαχειριστή"
          to="/users/register-admin"
        />
      </div>
    </div>
  );
}
