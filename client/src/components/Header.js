import React from 'react';
import logo from '../assets/images/patras-university-logo.png';

export default function Header({academicYear}) {

    return (
        <div className="flex flex-col sm:flex-row justify-center items-center sm:justify-center sm:items-center gap-6 border-b border-t border-gray-900/10 py-6">
            <div className="shrink-0 ">
                <img
                    src={logo}
                    alt="University of Patras logo"
                    className="h-24 w-24 "
                />
            </div>
            <div className="text-center sm:text-left">
                <h1 className="text-xl lg:text-2xl font-semibold text-gray-700">ΑΙΤΗΣΗ ΥΠΟΨΗΦΙΟΤΗΤΑΣ ΔΙΔΑΣΚΟΝΤΩΝ ΠΑΝΕΠΙΣΤΗΜΙΟΥ ΠΑΤΡΩΝ {academicYear}</h1>
                <p className="mt-1 text-base lg:text-lg text-gray-600">Πρόσκληση απόκτησης διδακτικής-ακαδημαϊκής εμπειρίας για νέους επιστήμονες, κατόχους διδακτορικού</p>
            </div>
        </div>
    );
}

