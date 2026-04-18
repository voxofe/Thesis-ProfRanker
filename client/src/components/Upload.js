import React, { useRef, useState } from "react";
import {
  DocumentTextIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import CustomSelect from "./CustomSelect";

export default function Upload(props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const maxFileBytes = 5 * 1024 * 1024;
  const contentLabel = props.contentLabel || props.content || "";
  const contentStatus = props.contentStatus || props.content || "";

  // Check if we have an existing file (filename string) or uploaded file (File object)
  const hasExistingFile =
    (typeof props.uploadedFile === "string" && props.uploadedFile) ||
    (props.uploadedFile &&
      !(props.uploadedFile instanceof File) &&
      typeof props.uploadedFile.name === "string" &&
      props.uploadedFile.name);
  const hasUploadedFile = props.uploadedFile instanceof File;
  const hasAnyFile = hasExistingFile || hasUploadedFile;
  const existingOptions = Array.isArray(props.existingOptions)
    ? props.existingOptions
    : [];
  const selectableOptions = existingOptions.filter(
    (option) => option && option.id && option.name
  );
  const canPickFromVault = selectableOptions.length > 0;
  const selectedExistingId =
    !hasUploadedFile &&
    props.uploadedFile &&
    typeof props.uploadedFile === "object" &&
    props.uploadedFile?.id
      ? String(props.uploadedFile.id)
      : "";

  const getDisplayName = () => {
    if (hasUploadedFile) {
      return props.uploadedFile.name;
    }
    if (hasExistingFile) {
      return typeof props.uploadedFile === "string"
        ? props.uploadedFile
        : props.uploadedFile?.name || "";
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
        const validationError = validateFile(droppedFile);
        if (!validationError) {
          setError("");
          props.onChange(droppedFile);
        } else {
          setError(validationError);
        }
        e.dataTransfer.clearData();
      }
    }
  };

  const parseAcceptList = () =>
    (props.accept || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

  const isFileAllowed = (file) => {
    const acceptList = parseAcceptList();
    if (acceptList.length === 0) return true;

    const name = file?.name?.toLowerCase() || "";
    const type = file?.type?.toLowerCase() || "";

    return acceptList.some((allowed) => {
      if (allowed.startsWith(".")) {
        return name.endsWith(allowed);
      }
      if (allowed.endsWith("/*")) {
        const prefix = allowed.replace("/*", "");
        return type.startsWith(prefix);
      }
      return type === allowed;
    });
  };

  const getAcceptErrorMessage = () => {
    if (!props.accept) return "Μη αποδεκτός τύπος αρχείου.";
    return `Επιτρέπονται μόνο: ${props.accept.replace(/\s+/g, "")}`;
  };

  const getSizeErrorMessage = () => "Μέγιστο μέγεθος αρχείου: 5MB.";

  const validateFile = (file) => {
    if (!isFileAllowed(file)) {
      return getAcceptErrorMessage();
    }
    if (file?.size > maxFileBytes) {
      return getSizeErrorMessage();
    }
    return "";
  };

  return (
    <div
      className={`mb-5 w-full min-w-0 ${
        props.disabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : ""
      } `}
    >
      <input
        ref={inputRef}
        id={props.id}
        name={props.name}
        type="file"
        className="sr-only"
        accept={props.accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const validationError = validateFile(file);
          if (!validationError) {
            setError("");
            props.onChange(file);
          } else {
            setError(validationError);
            e.target.value = "";
          }
        }}
        disabled={props.disabled}
      />
      <label
        htmlFor={props.icon}
        className="block text-sm/6 font-medium text-gray-900"
      >
        {props.label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        className={`relative mt-2 flex w-full min-w-0 justify-center rounded-lg pr-upload-surface
                    ${
                      hasAnyFile
                        ? "border-2 border-patras-buccaneer cursor-not-allowed pr-upload-texture-filled"
                        : "border border-dashed border-patras-buccaneer/25 pr-upload-texture-empty"
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
        <div className="text-center max-w-full">
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
            <p className="text-gray-800 mt-3 text-sm font-medium break-words">
              {getDisplayName()}
            </p>
          ) : (
            <div className="flex flex-wrap justify-center text-sm/6 text-gray-600 mt-3">
              {!canPickFromVault && (
                <>
                  <label
                    htmlFor={props.id}
                    className={`relative cursor-pointer rounded-md bg-white font-semibold text-patras-auChico text-center max-w-full break-words 
                                        focus-within:outline-none focus-within:ring-2 focus-within:ring-patras-buccaneer focus-within:ring-offset-2 
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-patras-buccaneer focus-visible:ring-offset-2
                                        hover:text-white hover:bg-patras-buccaneer 
                                        ${
                                          props.disabled
                                            ? "pointer-events-none"
                                            : ""
                                        }`}
                  >
                    <span className="m-2 block">
                      {`Αναρτήστε ${contentLabel} εδώ`}
                    </span>
                  </label>
                </>
              )}
              {canPickFromVault && (
                <div className="mt-2 w-full">
                  <CustomSelect
                    label="Επιλέξτε από τα ήδη αναρτημένα αρχεία σας"
                    value={selectedExistingId || "select"}
                    placeholder="Επιλέξτε..."
                    options={[
                      ...selectableOptions.map((option) => ({
                        value: String(option.id),
                        label: option.name,
                      })),
                      { value: "__new__", label: "Ανέβασμα νέου αρχείου" },
                    ]}
                    disabled={props.disabled}
                    onChange={(value) => {
                      if (value === "__new__") {
                        inputRef.current?.click();
                        return;
                      }
                      if (value === "select") {
                        return;
                      }
                      const selected = selectableOptions.find(
                        (option) => String(option.id) === value
                      );
                      if (selected) {
                        props.onSelectExisting?.({
                          id: selected.id,
                          name: selected.name,
                        });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
          {!hasAnyFile ? (
            <div>
              <span className="text-sm pl-1 mb-10">ή σύρετε και αφήστε</span>
              <p className="pt-2 text-xs/5 text-gray-600">
                PDF, DOC, DOCX, ODT · Μέγιστο μέγεθος: 5MB
              </p>
            </div>
          ) : (
            <p className="text-sm pt-[14px] mb-[20px] text-patras-buccaneer break-words">
              {hasExistingFile
                ? `Το αρχείο "${getDisplayName()}" είναι ήδη αναρτημένο`
                : props.id === "milatary-obligations-upload"
                ? "Η υπεύθυνη δήλωση"
                : contentStatus.charAt(0).toUpperCase() +
                  contentStatus.slice(1)}{" "}
              {hasUploadedFile && "επιλέχθηκε επιτυχώς"}
            </p>
          )}
        </div>
      </div>
      {error && !hasAnyFile && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
