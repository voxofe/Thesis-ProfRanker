import React from 'react';
import { FormDataProvider } from './contexts/FormDataContext';
import Form from './components/Form';
import Header from './components/Header';

export default function App() {

    const academicYear = "2024-2025";

    return (
        <FormDataProvider>
            <div className="flex justify-center min-h-screen">
                <div className="max-w-[1272px] px-10 sm:px-10 py-7 grid grid-cols-1 gap-y-2">
                    <Header academicYear={academicYear} />
                    <Form academicYear={academicYear} />
                    {/* <Footer /> */}
                </div>
            </div>
        </FormDataProvider>
    );
}
