import React, { useRef, useState } from "react";
import { DocumentTextIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/solid";
import CustomSelect from "./CustomSelect";
import TooltipGray from "./TooltipGray";

export default function UploadPHD(props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const maxFileBytes = props.maxFileBytes ?? 5 * 1024 * 1024;
  const contentLabel = props.contentLabel || props.content || "";
  const contentStatus = props.contentStatus || props.content || "";

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

  const checkStatus = props.checkStatus || null;
  const checkError = props.checkError || "";
  const checkPending = checkStatus === "pending";
  const checkSuccess = checkStatus === "success";
  const checkFailed = checkStatus === "failed";
  const uploadProgress =
    typeof props.checkUploadProgress === "number" ? props.checkUploadProgress : null;
  const isUploading = uploadProgress !== null && uploadProgress < 100;
  const isProcessing = (checkPending || props.checkLoading) && !isUploading;
  const canShowCheckButton =
    hasAnyFile && !checkSuccess && typeof props.onCheck === "function";

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

  const formatAcceptHint = () => {
    const acceptList = parseAcceptList();
    if (acceptList.length === 0) return "PDF, DOC, DOCX, ODT";
    const normalized = acceptList
      .map((item) => {
        if (item.startsWith(".")) return item.slice(1);
        if (item.includes("/")) return item.split("/")[1].replace("*", "");
        return item;
      })
      .filter(Boolean)
      .map((item) => item.toUpperCase());
    return normalized.join(", ");
  };

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

  const getSizeErrorMessage = () => {
    const maxMb = Math.round(maxFileBytes / (1024 * 1024));
    return `Μέγιστο μέγεθος αρχείου: ${maxMb}MB.`;
  };

  const validateFile = (file) => {
    if (!isFileAllowed(file)) {
      return getAcceptErrorMessage();
    }
    if (file?.size > maxFileBytes) {
      return getSizeErrorMessage();
    }
    return "";
  };

  const renderStatusMessage = () => {
    if (checkPending) {
      return "Γίνεται έλεγχος του PDF. Παρακαλώ περιμένετε.";
    }
    if (checkFailed) {
      return checkError || "Αποτυχία ελέγχου PDF.";
    }
    if (!checkSuccess) {
      return 'Πατήστε "Έλεγχος PDF" για να συνεχίσετε.';
    }
    return null;
  };

  const showCheckPrompt = !checkSuccess && !checkPending && !checkFailed;

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
            e.target.value = "";
          } else {
            setError(validationError);
            e.target.value = "";
          }
        }}
        disabled={props.disabled}
      />
      <label htmlFor={props.icon} className="block text-sm/6 font-medium text-gray-900">
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
                    ${props.compact ? "px-2 py-10" : "px-6 py-10"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }
            }}
          />
        )}
        <div className="text-center max-w-full">
          {!hasAnyFile || !checkSuccess ? (
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
          {hasAnyFile ? (
            <div className="mt-3 space-y-2">
              <p className="text-gray-800 text-sm font-medium break-words">
                {getDisplayName()}
              </p>
              {canShowCheckButton && (
                <button
                  type="button"
                  onClick={props.onCheck}
                  disabled={props.checkLoading || checkPending}
                  className="rounded-md bg-patras-buccaneer px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {props.checkLoading || checkPending ? "Έλεγχος..." : "Έλεγχος PDF"}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center text-sm/6 text-gray-600 mt-3">
              {!canPickFromVault && (
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
                  <span className="m-2 block">{`Αναρτήστε ${contentLabel} εδώ`}</span>
                </label>
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
                {formatAcceptHint()} · Μέγιστο μέγεθος: {Math.round(maxFileBytes / (1024 * 1024))}MB
              </p>
            </div>
          ) : checkSuccess ? (
            <p className="text-sm pt-[14px] mb-[20px] text-patras-buccaneer break-words">
              {hasExistingFile
                ? `Το αρχείο "${getDisplayName()}" είναι ήδη αναρτημένο`
                : props.id === "milatary-obligations-upload"
                ? "Η υπεύθυνη δήλωση"
                : contentStatus.charAt(0).toUpperCase() + contentStatus.slice(1)}{" "}
              {hasUploadedFile && "επιλέχθηκε επιτυχώς"}
            </p>
          ) : (
            <div className="pt-[14px] mb-[20px]">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`text-sm break-words ${
                    checkFailed ? "text-red-600" : "text-patras-buccaneer"
                  }`}
                >
                  {renderStatusMessage()}
                </p>
                {showCheckPrompt && (
                  <TooltipGray content="Ο έλεγχος PDF επιβεβαιώνει ότι η διατριβή είναι αναγνώσιμη και έχει το ελάχιστο απαιτούμενο περιεχόμενο.">
                    <span className="-mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-400 text-[11px] font-semibold text-gray-600">
                      i
                    </span>
                  </TooltipGray>
                )}
              </div>
              {isUploading && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-patras-buccaneer border-t-transparent" />
                    <span>Ανέβασμα αρχείου... {uploadProgress}%</span>
                  </div>
                  <div className="relative h-1 w-full max-w-xs overflow-hidden rounded-full bg-patras-buccaneer/20">
                    <div
                      className="absolute left-0 top-0 h-1 rounded-full bg-patras-buccaneer transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {isProcessing && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <style>{"@keyframes phd-progress {0%{transform:translateX(-100%);}50%{transform:translateX(0);}100%{transform:translateX(100%);}}"}</style>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-patras-buccaneer border-t-transparent" />
                    <span>Έλεγχος σε εξέλιξη...</span>
                  </div>
                  <div className="relative h-1 w-full max-w-xs overflow-hidden rounded-full bg-patras-buccaneer/20">
                    <div
                      className="absolute left-0 top-0 h-1 w-1/2 rounded-full bg-patras-buccaneer"
                      style={{ animation: "phd-progress 1.2s ease-in-out infinite" }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {error && !hasAnyFile && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
