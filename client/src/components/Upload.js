import React, { useState } from "react";
import {
  DocumentTextIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";

export default function Upload(props) {
  const [isDragging, setIsDragging] = useState(false);

  // Check if we have an existing file (filename string) or uploaded file (File object)
  const hasExistingFile =
    typeof props.uploadedFile === "string" && props.uploadedFile;
  const hasUploadedFile = props.uploadedFile instanceof File;
  const hasAnyFile = hasExistingFile || hasUploadedFile;

  const getDisplayName = () => {
    if (hasUploadedFile) {
      return props.uploadedFile.name;
    }
    if (hasExistingFile) {
      return props.uploadedFile; // This is the filename string from backend
    }
    return "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    if (!hasAnyFile) {
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
    <div
      className={`mb-5 ${
        props.disabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : ""
      } `}
    >
      <label
        htmlFor={props.icon}
        className="block text-sm/6 font-medium text-gray-900"
      >
        {props.label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        className={`relative mt-2 flex justify-center rounded-lg 
                    ${
                      hasAnyFile
                        ? "border-2 border-patras-buccaneer bg-white cursor-not-allowed"
                        : "border border-dashed border-patras-buccaneer/25"
                    } 
                    ${
                      isDragging && !hasAnyFile
                        ? "border-patras-buccaneer bg-patras-albescentWhite"
                        : ""
                    } 
                    ${props.compact ? "px-2 py-4" : "px-6 py-10"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Trash Icon */}
        {hasAnyFile && (
          <TrashIcon
            aria-hidden="true"
            className={`absolute top-2 right-2 h-6 w-6 cursor-pointer 
                            ${
                              hasAnyFile
                                ? "text-gray-400 hover:text-red-700"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
            onClick={() => {
              if (hasAnyFile) {
                props.onDelete(props.name);
                setIsDragging(false);
              }
            }}
          />
        )}
        <div className="text-center">
          {/* File Icon */}
          {!hasAnyFile ? (
            <DocumentTextIcon
              aria-hidden="true"
              className="mx-auto h-12 w-12 text-patras-buccaneer"
            />
          ) : (
            <CheckIcon
              aria-hidden="true"
              className="mx-auto h-12 w-12 text-patras-buccaneer"
            />
          )}
          {/* File Name or Upload Button */}
          {hasAnyFile ? (
            <p className="text-gray-800 mt-3 text-sm font-medium">
              {getDisplayName()}
            </p>
          ) : (
            <div className="flex text-sm/6 text-gray-600 mt-3">
              <label
                htmlFor={props.id}
                className={`relative cursor-pointer rounded-md bg-white font-semibold text-patras-auChico 
                                    focus-within:outline-none focus-within:ring-2 focus-within:ring-patras focus-within:ring-offset-2 
                                    hover:text-white hover:bg-patras-buccaneer 
                                    ${
                                      props.disabled
                                        ? "pointer-events-none"
                                        : ""
                                    }`}
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
          )}
          {!hasAnyFile ? (
            <div>
              <span className="text-sm pl-1 mb-10">ή σύρετε και αφήστε</span>
              <p className="pt-2 text-xs/5 text-gray-600">
                PDF, DOC, DOCX, ODT
              </p>
            </div>
          ) : (
            <p className="text-sm pt-[14px] mb-[20px] text-patras-buccaneer">
              {hasExistingFile
                ? `Το αρχείο "${getDisplayName()}" είναι ήδη αναρτημένο`
                : props.id === "milatary-obligations-upload"
                ? "Η υπεύθυνη δήλωση"
                : props.content.charAt(0).toUpperCase() +
                  props.content.slice(1)}{" "}
              {hasUploadedFile && "επιλέχθηκε επιτυχώς"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
