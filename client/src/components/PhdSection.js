import React from 'react';
import InputField from './InputField';
import { useFormData } from '../contexts/FormDataContext';
import Upload from './Upload';
import Checkbox from "./Checkbox";

export default function PersonalInfoSection(){

    const {formData, handleChange, handleFileChange, handleFileDelete} = useFormData();
    const today = new Date().toISOString().split("T")[0];

    return(
        <div className="py-5 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 border-b border-gray-900/10  ">
            <div className="sm:col-span-1">
                {/* PHD Upload*/}
                <Upload 
                    icon = "document-text"
                    label="Διδακτορικό Δίπλωμα"
                    content="το διδακτορικό σας"
                    id="phd-upload"
                    name="phd-upload"
                    accept=".pdf,.doc,.docx, .odt"
                    uploadedFile={formData.phdDocument}
                    onChange={(e) => handleFileChange('phdDocument', e)}
                    onDelete={() => handleFileDelete("phdDocument")}
                    required= {true}  
                />
                {/* PHD Acquisition Date*/}
                <InputField
                    label="Ημερομηνία λήψης διδακτορικού τίτλου"
                    id="date-field"
                    name="date-field"
                    type="date"
                    max={today}
                    min="2011-01-01"
                    defaultValue={today}
                    value={formData.phdAcquisitionDate}
                    onChange = {(value) => handleChange("phdAcquisitionDate", value)}
                    required={true}
                />    
            </div>             
            <div className="sm:col-span-1 ">             
                {/* Foreign Ιnstitute Checkbox*/}
                <Checkbox  className=""
                    label="Kατοχή τίτλου από Ίδρυμα του εξωτερικού (αναγνωρισμένο από τον ΔΟΑΤΑΠ)"
                    id="foreign-institute"
                    name="foreign-institute"
                    checked={formData.phdIsFromForeignInstitute}
                    onChange={(value) => handleChange('phdIsFromForeignInstitute', value)}
                />  
                {/* DOATAP Upload*/}
                <Upload className="pt-[40px]"
                    icon = "document-text"
                    label=""
                    content="το έγγραφο αναγνώρισης από τον ΔΟΑΤΑΠ"
                    id="doatap-upload"
                    name="doatap-upload"
                    accept=".pdf,.doc,.docx, .odt"
                    uploadedFile={formData.doatapDocument}
                    onChange={(e) => handleFileChange('doatapDocument', e)}
                    onDelete={() => handleFileDelete("doatapDocument")}
                    disabled={!formData.phdIsFromForeignInstitute}
                    required={formData.phdIsFromForeignInstitute}
                />                   
            </div>
        </div>       
    );
}