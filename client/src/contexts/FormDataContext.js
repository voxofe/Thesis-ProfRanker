import React, { createContext, useContext, useState } from 'react';

const FormDataContext = createContext();

export const useFormData = () => useContext(FormDataContext);

export const FormDataProvider = ({ children }) => {

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        scientificField: "",
        coursePlanDocument: null,
        phdDocument: null,
        phdAcquisitionDate: "",
        phdIsFromForeignInstitute: false,
        doatapDocument: null,
        papers: [
            {
                type: "", 
                paperTitle: "", 
                journalConfTitle: "",
                year: "",
                issn: "",
            }
        ],
        workExperience: 0,
        militaryObligationsDocument: null,
        cvDocument: null,
        hasNotParticipatedInPastProgram: false
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
    };

    return (
        <FormDataContext.Provider
            value={{
                formData,
                handleChange,
                handleFileChange,
                handleFileDelete,
            }}
        >
            {children}
        </FormDataContext.Provider>
    );
};
