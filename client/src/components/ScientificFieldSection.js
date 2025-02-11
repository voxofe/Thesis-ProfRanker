import React from 'react';
import { useFormData } from '../contexts/FormDataContext';
import InputField from './InputField';
import Upload from './Upload';

export default function ScientificFieldSection() {

    const {formData, handleChange, handleFileChange, handleFileDelete} = useFormData();

    return (
        <div className="py-5 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 border-b border-gray-900/10">
            <div className="sm:col-span-1 flex flex-col gap-2">
                {/* Scientific Fields */}
                <InputField 
                    label="Επιστημονικό Πεδίο"
                    id="scientific-field"
                    name="scientific-field"
                    optns={[
                        { label: "Τουρισμός", value: "Τουρισμός" },
                        { label: "Αγγλικά", value: "Αγγλικά" },
                      ]}
                    isDropdown = {true}
                    value={formData.scientificField}
                    onChange = {(value) => handleChange("scientificField", value)}
                    required = {true}
                />
                {/* List Area for Courses */}
                <div>
                    <label htmlFor="course-list" className="block text-sm font-medium text-gray-900">
                        Μαθήματα
                    </label>
                    <div
                        id="course-list"
                        className="mt-2 h-48 w-full overflow-y-auto rounded-md border border-gray-300 bg-gray-50 p-4 text-gray-700"
                    >
                        <ul className="list-disc list-inside">
                            <li>Κανένα μάθημα διαθέσιμο.</li>
                        </ul>
                    </div>
                </div>     
            </div>
            <div className="sm:col-span-1">
                {/* Course Plan Upload*/}
                <Upload 
                    icon = "document-text"
                    label="Σχεδιάγραμμα διδασκαλίας όλων των μαθημάτων του Επιστημονικού Πεδίου"
                    content="το σχεδιάγραμμα διδασκαλίας"
                    id="course-plan-upload"
                    name="course-plan-upload"
                    accept=".pdf,.doc,.docx, .odt"
                    uploadedFile={formData.coursePlanDocument}
                    onChange={(e) => handleFileChange('coursePlanDocument', e)}
                    onDelete={() => handleFileDelete("coursePlanDocument")}
                    required= {true}  
                /> 
            </div>  
        </div>
    );
}
