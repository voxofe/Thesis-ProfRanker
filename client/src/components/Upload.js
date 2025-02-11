import React, { useState } from "react";
import { DocumentTextIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/solid";

export default function Upload(props) {

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        if (!props.uploadedFile) {
            e.preventDefault();
            setIsDragging(false);
    
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const droppedFile = e.dataTransfer.files[0];
                props.onChange(droppedFile);
                e.dataTransfer.clearData();
            }
        }
    };

    return (
        <div className={`mb-5 ${props.disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""} `}>
            <label htmlFor={props.icon} className="block text-sm/6 font-medium text-gray-900">
                {props.label}
            </label>
            <div
                className={`relative mt-2 flex justify-center rounded-lg 
                    ${props.uploadedFile ? 
                        "border-2 border-patras-buccaneer bg-white cursor-not-allowed" : 
                        "border border-dashed border-patras-buccaneer/25"} 
                    ${isDragging && !props.uploadedFile ? "border-patras-buccaneer bg-patras-albescentWhite" : ""} 
                    px-6 py-10`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Trash Icon */}
                {props.uploadedFile && 
                    <TrashIcon
                        aria-hidden="true"
                        className={`absolute top-2 right-2 h-6 w-6 cursor-pointer 
                            ${props.uploadedFile ? "text-gray-400 hover:text-red-700" : "text-gray-300 cursor-not-allowed"}`}
                        onClick={() => {
                            if (props.uploadedFile) {
                                props.onDelete(props.name) 
                                setIsDragging(false)
                            }
                        }}
                    />
                }
                <div className="text-center">
                    {/* File Icon */}
                    {!props.uploadedFile ? 
                        <DocumentTextIcon
                            aria-hidden="true"
                            className="mx-auto h-12 w-12 text-patras-buccaneer"
                        />
                     : 
                        <CheckIcon
                            aria-hidden="true"
                            className="mx-auto h-12 w-12 text-patras-buccaneer"
                        />
                    }
                    {/* File Name or Upload Button */}
                    {props.uploadedFile ? 
                        <p className="text-gray-800 mt-3 text-sm font-medium">
                            {props.uploadedFile.name}
                        </p>
                    : 
                        <div className="flex text-sm/6 text-gray-600 mt-3">
                            <label
                                htmlFor={props.id}
                                className={`relative cursor-pointer rounded-md bg-white font-semibold text-patras-auChico 
                                    focus-within:outline-none focus-within:ring-2 focus-within:ring-patras focus-within:ring-offset-2 
                                    hover:text-white hover:bg-patras-buccaneer 
                                    ${props.disabled ? "pointer-events-none" : ""}`}
                            >
                                <span className="m-2">Αναρτήστε {props.content} εδώ </span>
                                <input
                                    id={props.id}
                                    name={props.name}
                                    type="file"
                                    className="sr-only"
                                    onChange={(e) => props.onChange(e.target.files[0])}
                                    disabled={props.disabled}
                                />
                            </label>
                        </div>
                    }
                    {!props.uploadedFile ? 
                        <div>
                            <span className="text-sm pl-1 mb-10">ή σύρετε και αφήστε</span>
                            <p className="pt-2 text-xs/5 text-gray-600">PDF, DOC, DOCX, ODT</p>
                        </div>
                    :
                        <p className="text-sm pt-[14px] mb-[20px] text-patras-buccaneer">
                            {props.id==="milatary-obligations-upload" ? "Η υπεύθυνη δήλωση": props.content.charAt(0).toUpperCase() + props.content.slice(1)} ανέβηκε επιτυχώς
                        </p>
                    
                    }
                </div>
            </div>
        </div>
    );
}
