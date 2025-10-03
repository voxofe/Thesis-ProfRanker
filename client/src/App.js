import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import BackLink from "./components/BackLink";
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
import { PositionsProvider } from "./contexts/PositionsContext";
import { PreviousLocationProvider } from "./contexts/PreviousLocationContext";

export default function App() {
  return (
    <AuthProvider>
      <PositionsProvider>
        <Router>
          <PreviousLocationProvider>
            <AppContent />
          </PreviousLocationProvider>
        </Router>
      </PositionsProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const academicYear = "2021-2022";
  const { isLoggedIn, currentUser, isLoading } = useAuth();
  const location = useLocation();
  const shouldShowBackLink = location.pathname !== "/" && location.pathname !== "/home" && location.pathname !== "/login" && location.pathname !== "/register";

  // Show loading screen while authentication is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center min-h-screen min-w-screen">
        <div className="w-[1300px] px-7 py-4 flex flex-col min-h-screen">
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

  return (
    <div className="flex justify-center min-h-screen min-w-screen">
      <div className="w-[1270px] px-7 py-4 flex flex-col min-h-screen">
        <Header academicYear={academicYear} />
        {/* Back link shown below header on non-home routes */}
        {shouldShowBackLink && (
          <div className="mt-4">
            <BackLink />
          </div>
        )}
        <div className="flex-1 pt-5">
          <Routes>
            {isLoggedIn ? (
              <>
                {/* Routes for logged-in users */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/" element={<Navigate to="/home" replace />} />

                <Route path="/score/total" element={<RankingPage />} />


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
