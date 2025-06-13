import React from 'react';
import { useFormData } from '../../contexts/FormDataContext';
import InputField from '../InputField';

export default function PersonalInfoSection(){
    
    const {formData, handleChange}  = useFormData();

    return(
        <div className="py-5 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-3 border-b border-gray-900/10  ">
            <div className="sm:col-span-1">
                {/* First Name */}
                <InputField  
                    label="Όνομα" 
                    id="first-name" 
                    name="first-name" 
                    type="text" 
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange = {(value) => handleChange("firstName", value)}
                    required= {true}
                />      
            </div>
            <div className="sm:col-span-1">
                {/* Last Name */}
                <InputField 
                    label="Επώνυμο" 
                    id="last-name" 
                    name="last-name" 
                    type="text" 
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange = {(value) => handleChange("lastName", value)}
                    required= {true}
                />
            </div> 
            <div className="sm:col-span-1">
                {/* Email */}
                <InputField 
                    label="Email" 
                    id="email" 
                    name="email" 
                    type="email" 
                    autoComplete="email"
                    value={formData.email}
                    onChange = {(value) => handleChange("email", value)}
                    required= {true}
                /> 
            </div> 
        </div>       
    );
}