import React from 'react';
import { useFormData } from '../contexts/FormDataContext';
import PersonalInfoSection from './PersonalInfoSection';
import PhdSection from './PhdSection';
import ScientificFieldSection from './ScientificFieldSection';
import BioSection from './BioSection';
import PapersSection from './PapersSection';
import axios from 'axios';


export default function Form({academicYear}) {

    const { formData } = useFormData();
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        const formDataToSend = new FormData();
        
        // Append text fields
        Object.keys(formData).forEach((key) => {
            if (formData[key] && typeof formData[key] !== "object") {
                formDataToSend.append(key, formData[key]);
            }
        });
    
        // Append files
        ["coursePlanDocument", "phdDocument", "doatapDocument", "militaryObligationsDocument", "cvDocument"].forEach(field => {
            if (formData[field]) {
                formDataToSend.append(field, formData[field]);
            }
        });
    
        // Convert papers to a JSON string and append it to the FormData
        formDataToSend.append("papers", JSON.stringify(formData.papers));
    
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/submit/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'  // Content type for file uploads
                }
            });
    
            console.log('Form submitted successfully:', response.data);
            alert("Form submitted successfully!");
        } catch (error) {
            console.error('Error submitting form:', error);
            alert("Failed to submit the form.");
        }
    };
    
    
    return (
        <form  className="grid grid-cols-1 gap-y-5"onSubmit={handleSubmit}>
            <PersonalInfoSection />
            <ScientificFieldSection />
            <PhdSection />
            <PapersSection />
            <BioSection academicYear={academicYear}/>

            <div className="mt-1 flex items-center justify-center sm:justify-end gap-x-6 sm:py-4">
                <button
                    type="submit"
                    className="rounded-md bg-patras-buccaneer  px-3 py-2 text-sm font-semibold text-white shadow-sm
                    hover:bg-patras-sanguineBrown 
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                    Υποβολή Αίτησης
                </button>
            </div>
        </form>
    );
}

