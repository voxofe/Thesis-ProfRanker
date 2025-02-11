import React from 'react';
import { useFormData } from '../contexts/FormDataContext';
import InputField from './InputField';
import Upload from './Upload';
import Checkbox from "./Checkbox";

export default function BioSection({academicYear}){

    const {formData, handleChange, handleFileChange, handleFileDelete} = useFormData();

    return(
        <div className="py-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 border-b border-gray-900/10  ">
            <div className="sm:col-span-1 flex flex-col gap-2">
                {/* CV Upload*/}
                <Upload 
                    icon = "document-text"
                    label="Βιογραφικό Σημείωμα"
                    content="τo βιογραφικό σας"
                    id="cv-upload"
                    name="cv-upload"    
                    accept=".pdf,.doc,.docx, .odt"
                    uploadedFile={formData.cvDocument}
                    onChange={(e) => handleFileChange('cvDocument', e)}
                    onDelete={() => handleFileDelete("cvDocument")}
                    required= {true}  
                />
                {/* Νot Participated Checkbox*/}
                <Checkbox  className=""
                    label="Δεν έχω επιλεγεί σε 
                            άλλο πρόγραμμα Απόκτησης Ακαδημαϊκής Διδακτικής Εμπειρίας,
                            στο πλαίσιο των προηγούμενων προσκλήσεων ΕΔΒΜ 20 (ακαδ.
                            έτος 2016‐2017), ΕΔΒΜ 45 (ακαδ. έτος 2017‐2018), ΕΔΒΜ 82 (ακαδ.
                            έτος 2018‐2019), καθώς και της ΕΔΒΜ 96 (ακαδ. έτη 2019‐2020 και 
                            2020‐2021) του ΕΠ ΑΝΑΔ ΕΔΒΜ 2014‐2020."
                    id="not-participated"
                    name="not-participated"
                    checked={formData.hasNotParticipatedInPastProgram}
                    onChange={(value) => handleChange('hasNotParticipatedInPastProgram', value)}
                /> 
            </div>             
            <div className="sm:col-span-1 flex flex-col gap-2">
                {/* Military Obligations Upload*/}
                <Upload className=""
                    icon = "document-text"
                    label={`Υπεύθυνη Δήλωση εκπλήρωσης Στρατιωτικών Υποχρεώσεων ή νόμιμης απαλλαγής από αυτών ή αναβολής για το ακαδημαϊκό έτος ${academicYear}`}
                    content="την υπεύθυνη δήλωση"
                    id="milatary-obligations-upload"
                    name="milary-obligations-upload"
                    accept=".pdf,.doc,.docx, .odt"
                    uploadedFile={formData.militaryObligationsDocument}
                    onChange={(e) => handleFileChange('militaryObligationsDocument', e)}
                    onDelete={() => handleFileDelete("militaryObligationsDocument")}
                    required={true}
                />                
                {/* Work Experience */}
                <InputField label="Χρόνια μεταδιδακτορικής εργασιακής εμπειρίας (εξαιρείται η διδακτική εμπερία)" 
                    id="experience-years" 
                    name="experience-years"                    
                    type= "number"
                    min="0"
                    max="14"
                    defaultValue = {0}
                    value={formData.workExperience}
                    onChange = {(value) => handleChange("workExperience", value)}
                    required={true}
                />    
            </div>
        </div>       
    );
}