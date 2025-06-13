import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FormDataProvider } from './contexts/FormDataContext';
import Header from './components/Header';
import Form from './pages/Form';
import ScorePage from './pages/ScorePage';
import { adminData, applicantData } from './dummyApplicantData';

export default function App() {
    const academicYear = "2021-2022";

    return (
        <Router>
            <div className="flex justify-center min-h-screen">
                <div className="w-[1270px] px-10 py-7 grid grid-cols-1 gap-y-2">
                    <Header academicYear={academicYear} />
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <FormDataProvider>
                                    <Form academicYear={academicYear} />
                                </FormDataProvider>
                            }
                        />
                        <Route
                            path="/score/admin"
                            element={<ScorePage role="admin" data={adminData} />}
                        />
                        <Route
                            path="/score/applicant/:id"
                            element={<ScorePage role="applicant"  />}
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}
