import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Form from "./pages/Form";
import ApplicantScorePage from "./pages/ApplicantScorePage";
import RankingPage from "./pages/RankingPage";
import {
  FormDataProvider,
  AuthProvider,
  useAuth,
  ValidationProvider,
} from "./contexts";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { deadlineDate } from "./constants";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const academicYear = "2021-2022";
  const { isLoggedIn, currentUser, isLoading } = useAuth();

  // Mock deadline date - in production this would come from a config or API
  const isAfterDeadline = new Date() > deadlineDate;

  // Show loading screen while authentication is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center min-h-screen min-w-screen">
        <div className="w-[1270px] px-7 py-4 flex flex-col min-h-screen">
          <Header academicYear={academicYear} />
          <div className="flex flex-1 justify-center items-center py-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-patras-buccaneer"></div>
              <p className="mt-4 text-gray-600">Φόρτωση...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to check if user can access certain routes
  const canAccessScoreTotal = () => {
    // Only logged-in users can access this function now
    const userRole = currentUser?.role;
    if (userRole === "admin") {
      // Admins can always see score total
      return true;
    }
    if (userRole === "applicant" || userRole === "guest") {
      // Applicants and guests can see score total after deadline
      return isAfterDeadline;
    }

    return false;
  };

  console.log("Can Access Score Total:", canAccessScoreTotal(), {
    userRole: currentUser?.role,
    isAfterDeadline,
  });

  return (
    <div className="flex justify-center min-h-screen min-w-screen">
      <div className="w-[1270px] px-7 py-4 flex flex-col min-h-screen">
        <Header academicYear={academicYear} />
        <div className="flex-1 pt-5">
          <Routes>
            {isLoggedIn ? (
              <>
                {/* Routes for logged-in users */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/" element={<Navigate to="/home" replace />} />

                {/* Score Total Route - conditional access */}
                {canAccessScoreTotal() ? (
                  <Route path="/score/total" element={<RankingPage />} />
                ) : null}

                {(currentUser?.role === "guest" ||
                  currentUser?.role === "applicant") && (
                  <Route
                    path="/form"
                    element={
                      <FormDataProvider>
                        <ValidationProvider>
                          <Form academicYear={academicYear} />
                        </ValidationProvider>
                      </FormDataProvider>
                    }
                  />
                )}

                {/* Applicant score route - accessible by applicants and admins */}
                {(currentUser?.role === "applicant" ||
                  currentUser?.role === "admin") && (
                  <Route path="/score/applicant/:id" element={<ApplicantScorePage />} />
                )}

                {/* Admin routes */}
                {currentUser?.role === "admin" && (
                  <Route
                    path="/score/admin"
                    element={<ApplicantScorePage role="admin" />}
                  />
                )}

                <Route
                  path="/register-admin"
                  element={<Register isAdmin={true} />}
                />

                {/* Fallback for logged in users */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </>
            ) : (
              <>
                {/* Routes for non-logged-in users - only login and register */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Redirect all other routes to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
}
