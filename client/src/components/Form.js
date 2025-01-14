
import React, { useState } from 'react';
import axios from 'axios';
import PersonalInfoSection from './PersonalInfoSection';
import PhdSection from './PhdSection'
import ScientificFieldSection from './ScientificFieldSection';
import BioSection from './BioSection';
import PublicationSection from './PublicationsSections';

export default function Form({academicYear}) {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        scientificField: '',
        coursePlanDocument: null,
        phdDocument: null,
        phdAcquisitionDate: '',
        phdIsFromForeignInstitue: false,
        doatapDocument: null,
        publicationsAndPresentations: [],
        workExperience: 0,
        cvDocument: null,
        hasParticipatedInPastProgram: false,
        militaryObligationsDocument: null,
        
    });
    
    const handleChange = (field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };
    
    const handleFileChange = (field, file) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: file,
        }));
    };

    const handleFileDelete = (field) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: null,
        }));
        console.log(`File for field "${field}" has been deleted.`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form data submitted:', formData);

    };

    return (
        <form  onSubmit={handleSubmit}>
            <PersonalInfoSection 
                formData={formData}
                onChange={handleChange}
            />
            <ScientificFieldSection             
                formData={formData}
                onChange={handleChange}
                onFileChange={handleFileChange}
                onDelete={handleFileDelete}
            />
            <PhdSection             
                formData={formData}
                onChange={handleChange}
                onFileChange={handleFileChange}
                onDelete={handleFileDelete}
            />
            <BioSection             
                formData={formData}
                onChange={handleChange}
                onFileChange={handleFileChange}
                onDelete={handleFileDelete}
                academicYear={academicYear}
            />

            <div className="mt-6 flex items-center justify-end gap-x-6 pt-6">
                <button
                    type="submit"
                    className="rounded-md bg-patras-buccaneer px-3 py-2 text-sm font-semibold text-white shadow-sm
                    hover:bg-patras-sanguineBrown 
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                    Υποβολή Αίτησης
                </button>
            </div>
        </form>
    )
}

