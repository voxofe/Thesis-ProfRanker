import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import BackLinkController from "./components/BackLinkController";
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationScore from "./pages/ApplicationScore";
import Profile from "./pages/Profile";
import Ranking from "./pages/Ranking";
import Positions from "./pages/Positions";
import PositionsAll from "./pages/PositionsAll";
import PositionsCreate from "./pages/PositionsCreate";
import PositionsEdit from "./pages/PositionsEdit";
import ScientificFields from "./pages/ScientificFields";
import ScientificFieldsAll from "./pages/ScientificFieldsAll";
import ScientificFieldsCreate from "./pages/ScientificFieldsCreate";
import ScientificFieldsEdit from "./pages/ScientificFieldsEdit";
import {
  FormDataProvider,
  AuthProvider,
  useAuth,
  ValidationProvider,
  PositionsProvider,
  PreviousLocationProvider,
  CreatePositionValidationProvider,
  usePositions
} from "./contexts";


export default function App() {
  return (
    <CreatePositionValidationProvider>
      <AuthProvider>
        <PositionsProvider>
          <Router>
            <PreviousLocationProvider>
              <AppContent />
            </PreviousLocationProvider>
          </Router>
        </PositionsProvider>
      </AuthProvider>
    </CreatePositionValidationProvider>
  );
}

function AppContent() {
  const academicYear = "2021-2022";
  const { isLoggedIn, currentUser, isLoading } = useAuth();
  const { positions = [], loading: positionsLoading } = usePositions();
  const location = useLocation();
  const shouldShowBackLink = location.pathname !== "/" && location.pathname !== "/home" && location.pathname !== "/login" && location.pathname !== "/register";

  const activePositions = React.useMemo(
    () => (positions || []).filter((p) => p?.state === "active"),
    [positions]
  );

  const userRole = currentUser?.role;
  const applicationDisabled =
    (userRole === "guest" || userRole === "applicant") &&
    !positionsLoading &&
    activePositions.length === 0;

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
      <div className="w-[1330px] px-7 py-4 flex flex-col min-h-screen">
        <Header academicYear={academicYear} />
        {/* Back link shown below header on non-home routes */}
        {shouldShowBackLink && (
          <div className="mt-4">
            <BackLinkController />
          </div>
        )}
        <div className="flex-1 pt-5">
          <Routes>
            {isLoggedIn ? (
              <>
                {/* Routes for logged-in users */}
                <Route path="/home" element={<Home />} />
                <Route path="/" element={<Navigate to="/home" replace />} />

                <Route path="/ranking" element={<Ranking />} />
                <Route path="/score/total" element={<Navigate to="/ranking" replace />} />

                <Route path="/profile" element={<Profile />} />


                {(currentUser?.role === "guest" ||
                  currentUser?.role === "applicant") && (
                  <Route
                    path="/form"
                    element={
                      applicationDisabled ? (
                        <Navigate to="/home" replace />
                      ) : (
                        <FormDataProvider>
                          <ValidationProvider>
                            <ApplicationForm academicYear={academicYear} />
                          </ValidationProvider>
                        </FormDataProvider>
                      )
                    }
                  />
                )}

                {/* Applicant score route - accessible by applicants and admins */}
                {(currentUser?.role === "applicant" ||
                  currentUser?.role === "admin") && (
                  <>
                    <Route path="/application-score/:id" element={<ApplicationScore />} />
                    <Route path="/score/applicant/:id" element={<Navigate to="/application-score/:id" replace />} />
                  </>
                )}

                {/* Admin-only routes */}
                {currentUser?.role === "admin" && (
                  <>
                    <Route path="/register-admin" element={<Register isAdmin={true} />} />
                    <Route path="/positions" element={<Positions />} />
                    <Route path="/positions/all" element={<PositionsAll />} />
                    <Route path="/positions/edit" element={<PositionsEdit />} />
                    <Route path="/positions/create" element={
                      <React.Suspense fallback={<div>Φόρτωση...</div>}>
                        {React.createElement(require("./pages/PositionsCreate").default)}
                      </React.Suspense>
                    } />
                    <Route path="/scientific-fields" element={<ScientificFields />} />
                    <Route path="/scientific-fields/all" element={<ScientificFieldsAll />} />
                    <Route path="/scientific-fields/edit" element={<ScientificFieldsEdit />} />
                    <Route path="/scientific-fields/create" element={
                      <React.Suspense fallback={<div>Φόρτωση...</div>}>
                        {React.createElement(require("./pages/ScientificFieldsCreate").default)}
                      </React.Suspense>
                    } />
                  </>
                )}

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
