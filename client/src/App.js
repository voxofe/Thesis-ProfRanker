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
import RegisterAdmin from "./pages/RegisterAdmin";
import Home from "./pages/Home";
import BackLinkController from "./components/BackLinkController";
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationScore from "./pages/ApplicationScore";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Ranking from "./pages/Ranking";
import ScientificFields from "./pages/ScientificFields";
import ScientificFieldsView from "./pages/ScientificFieldsView";
import ScientificFieldsCreate from "./pages/ScientificFieldsCreate";
import ScientificFieldSingle from "./pages/ScientificFieldSingle";
import Users from "./pages/Users";
import UsersView from "./pages/UsersView";
import Analytics from "./pages/Analytics";
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
import { ToastProvider } from "./contexts/ToastContext";


export default function App() {
  return (
    <CreatePositionValidationProvider>
      <AuthProvider>
        <ToastProvider>
          <PositionsProvider>
            <Router>
              <PreviousLocationProvider>
                <AppContent />
              </PreviousLocationProvider>
            </Router>
          </PositionsProvider>
        </ToastProvider>
      </AuthProvider>
    </CreatePositionValidationProvider>
  );
}

function AppContent() {
  const academicYear = "2021-2022";
  const { isLoggedIn, currentUser, isLoading } = useAuth();
  const { positions = [], loading: positionsLoading } = usePositions();
  const location = useLocation();
  const searchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const formMode = (searchParams.get("mode") || "new").toLowerCase();
  const isEditMode = formMode === "edit";
  const routesKey = `${location.pathname}${location.search}${location.hash}`;
  const shouldShowBackLink = location.pathname !== "/" && location.pathname !== "/home" && location.pathname !== "/login" && location.pathname !== "/register";


  const activePositions = React.useMemo(
    () => (positions || []).filter((p) => p?.state === "active"),
    [positions]
  );

  const userRole = currentUser?.role;
  const appliedPositionIds = React.useMemo(() => {
    const applications = currentUser?.applications || [];
    return applications
      .map((app) => app?.positionId)
      .filter((posId) => posId !== null && posId !== undefined && posId !== "");
  }, [currentUser]);

  const availablePositionsForApplicant = React.useMemo(() => {
    if (userRole !== "applicant") return activePositions;
    const appliedSet = new Set(appliedPositionIds || []);
    return activePositions.filter((p) => !appliedSet.has(p?.id));
  }, [userRole, activePositions, appliedPositionIds]);

  const applicationDisabled =
    (userRole === "guest" || userRole === "applicant") &&
    !positionsLoading &&
    (activePositions.length === 0 ||
      (userRole === "applicant" && availablePositionsForApplicant.length === 0));

  const canAccessForm = isEditMode || !applicationDisabled;

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
          <Routes location={location} key={routesKey}>
            {isLoggedIn ? (
              <>
                {/* Routes for logged-in users */}
                <Route path="/home" element={<Home />} />
                <Route path="/" element={<Navigate to="/home" replace />} />

                <Route path="/ranking" element={<Ranking />} />
                <Route path="/score/total" element={<Navigate to="/ranking" replace />} />

                <Route path="/my-applications" element={<MyApplications />} />

                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />


                {(currentUser?.role === "guest" ||
                  currentUser?.role === "applicant") && (
                  <Route
                    path="/form"
                    element={
                      !canAccessForm ? (
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
                    <Route path="/profile/:userId" element={<Profile />} />
                    <Route path="/my-applications/:userId" element={<MyApplications />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/users/view" element={<UsersView />} />
                    <Route path="/users/register-admin" element={<RegisterAdmin />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/register-admin" element={<RegisterAdmin />} />
                    <Route path="/positions/create" element={
                      <React.Suspense fallback={<div>Φόρτωση...</div>}>
                        {React.createElement(require("./pages/PositionCreate").default)}
                      </React.Suspense>
                    } />
                    <Route path="/scientific-fields" element={<ScientificFields />} />
                    <Route path="/scientific-fields/view" element={<ScientificFieldsView />} />
                    <Route path="/scientific-fields/view/:id" element={<ScientificFieldSingle />} />
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
