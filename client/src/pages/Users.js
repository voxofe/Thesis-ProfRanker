import React from "react";
import HomePagePanel from "../components/HomePagePanel";
import PageTitle from "../components/PageTitle";

export default function Users() {
  return (
    <div className="max-w-4xl mx-auto p-0">
        <PageTitle className="mb-6">Διαχείριση χρηστών</PageTitle>
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
