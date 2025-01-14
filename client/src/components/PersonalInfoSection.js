import React from 'react';
import InputField from './InputField';

export default function PersonalInfoSection({formData, onChange}){
    
    return(
        
        <div className="py-5 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-3 border-b border-gray-900/10  ">

            {/* Column 1*/}
            <div className="sm:col-span-1">
                {/* First Name */}
                <InputField  
                    label="Όνομα" 
                    id="first-name" 
                    name="first-name" 
                    type="text" 
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange = {(value) => onChange("firstName", value)}
                    required= {true}
                />      
            </div>

            {/* Column 2*/}
            <div className="sm:col-span-1">
                {/* Last Name */}
                <InputField 
                    label="Επώνυμο" 
                    id="last-name" 
                    name="last-name" 
                    type="text" 
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange = {(value) => onChange("lastName", value)}
                    required= {true}
                />
            </div> 

            {/* Column 3*/}
            <div className="sm:col-span-1">
                {/* Email */}
                <InputField 
                    label="Email" 
                    id="email" 
                    name="email" 
                    type="email" 
                    autoComplete="email"
                    value={formData.email}
                    onChange = {(value) => onChange("email", value)}
                    required= {true}
                /> 
            </div> 

        </div>       
    )
}