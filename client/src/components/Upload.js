import React, { useRef, useState } from "react";
import {
  DocumentTextIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import CustomSelect from "./CustomSelect";
import { useLanguage } from "../contexts";

export default function Upload(props) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const maxFileBytes = props.maxFileBytes ?? 5 * 1024 * 1024;
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
  const checkEnabled = !!props.checkEnabled;
  const checkStatus = props.checkStatus || null;
  const checkError = props.checkError || "";
  const checkPending = checkStatus === "pending";
  const checkSuccess = checkStatus === "success";
  const checkFailed = checkStatus === "failed";
  const canShowCheckButton =
    checkEnabled &&
    hasAnyFile &&
    !checkSuccess &&
    typeof props.onCheck === "function";
  const showCheckMessage = checkEnabled && hasAnyFile && !checkSuccess;

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
    if (!props.accept) return t("upload.invalidType");
    return t("upload.allowedOnly", { types: props.accept.replace(/\s+/g, "") });
  };

  const getSizeErrorMessage = () => {
    const maxMb = Math.round(maxFileBytes / (1024 * 1024));
    return t("upload.maxSizeError", { mb: maxMb });
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

  const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const base = 1024;
    const exponent = Math.min(
      Math.floor(Math.log(bytes) / Math.log(base)),
      units.length - 1
    );
    const value = bytes / Math.pow(base, exponent);
    const formatted = exponent === 0 ? Math.round(value) : value.toFixed(1);
    return `${formatted} ${units[exponent]}`;
  };

  const getDisplaySize = () => {
    if (hasUploadedFile) return formatFileSize(props.uploadedFile.size);
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
            e.target.value = "";
          } else {
            setError(validationError);
            e.target.value = "";
          }
        }}
        disabled={props.disabled}
      />
      <label
        htmlFor={props.icon}
        className="block text-sm/6 font-medium text-gray-900 dark:text-[var(--color-text-primary)]"
      >
        {props.label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        className={`relative mt-2 flex w-full min-w-0 justify-center rounded-lg pr-upload-surface
                    ${
                      hasAnyFile
                        ? "border-2 border-patras-buccaneer dark:border-[var(--color-border-accent)] cursor-not-allowed pr-upload-texture-filled"
                        : "border border-dashed border-patras-buccaneer/25 dark:border-[var(--color-border)] pr-upload-texture-empty"
                    }
                    ${
                      isDragging && !hasAnyFile
                        ? "border-patras-buccaneer bg-patras-albescentWhite dark:border-[var(--color-primary)] dark:bg-[var(--color-bg-muted)]"
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
                                ? "text-gray-400 dark:text-[var(--color-text-muted)] hover:text-red-700 dark:hover:text-red-500"
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
          {/* File Icon */}
          {!hasAnyFile ? (
            <DocumentTextIcon
              aria-hidden="true"
              className="mx-auto h-12 w-12 text-patras-buccaneer dark:text-[var(--color-text-secondary)]"
            />
          ) : checkEnabled && !checkSuccess ? (
            <DocumentTextIcon
              aria-hidden="true"
              className="mx-auto h-12 w-12 text-patras-buccaneer dark:text-[var(--color-text-secondary)]"
            />
          ) : (
            <CheckIcon
              aria-hidden="true"
              className="mx-auto h-12 w-12 text-patras-buccaneer dark:text-[var(--color-text-secondary)]"
            />
          )}
          {/* File Name or Upload Button */}
          {hasAnyFile ? (
            <div className="mt-3 space-y-2">
              <div className="text-gray-800 dark:text-[var(--color-text-primary)] text-sm font-medium break-words">
                {getDisplayName()}
                {hasUploadedFile && (
                  <span className="text-gray-500 dark:text-[var(--color-text-muted)] font-normal"> ({getDisplaySize()})</span>
                )}
              </div>
              {canShowCheckButton && (
                <button
                  type="button"
                  onClick={props.onCheck}
                  disabled={props.checkLoading || checkPending}
                  className="rounded-md bg-patras-buccaneer px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-patras-sanguineBrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {props.checkLoading || checkPending ? t("upload.checking") : t("upload.checkPdf")}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center text-sm/6 text-gray-600 dark:text-[var(--color-text-secondary)] mt-3">
              {!canPickFromVault && (
                <>
                  <label
                    htmlFor={props.id}
                    className={`relative cursor-pointer rounded-md bg-white dark:bg-[var(--color-bg-card)] font-semibold text-patras-auChico dark:text-white text-center max-w-full break-words 
                                        focus-within:outline-none focus-within:ring-2 focus-within:ring-patras-buccaneer focus-within:ring-offset-2 
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-patras-buccaneer focus-visible:ring-offset-2
                                        hover:text-white hover:bg-patras-buccaneer dark:hover:bg-[var(--color-primary-hover)] 
                                        ${
                                          props.disabled
                                            ? "pointer-events-none"
                                            : ""
                                        }`}
                  >
                    <span className="m-2 block">
                      {t("upload.dropHere", { content: contentLabel })}
                    </span>
                  </label>
                </>
              )}
              {canPickFromVault && (
                <div className="mt-2 w-full">
                  <CustomSelect
                    label={t("upload.pickExisting")}
                    value={selectedExistingId || "select"}
                    options={[
                      ...selectableOptions.map((option) => ({
                        value: String(option.id),
                        label: option.name,
                      })),
                      { value: "__new__", label: t("upload.uploadNew") },
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
              <span className="text-sm pl-1 mb-10 dark:text-white">{t("upload.dragDrop")}</span>
              <p className="pt-2 text-xs/5 text-gray-600 dark:text-[var(--color-text-secondary)]">
                {formatAcceptHint()} · {t("upload.maxSizeHint", { mb: Math.round(maxFileBytes / (1024 * 1024)) })}
              </p>
            </div>
          ) : (
            <p className="text-sm pt-[14px] mb-[20px] text-patras-buccaneer dark:text-[var(--color-text-primary)] break-words">
              {showCheckMessage && checkPending && t("upload.pdfChecking")}
              {showCheckMessage && checkFailed && (checkError || t("upload.pdfFailed"))}
              {showCheckMessage && !checkPending && !checkFailed && t("upload.pdfPrompt")}
              {checkEnabled && checkSuccess &&
                (hasExistingFile
                  ? t("upload.alreadyUploaded", { name: getDisplayName() })
                  : props.id === "milatary-obligations-upload"
                  ? t("upload.declaration")
                  : contentStatus.charAt(0).toUpperCase() +
                    contentStatus.slice(1))}{" "}
              {checkEnabled && checkSuccess && hasUploadedFile && t("upload.selectedSuccess")}
              {!checkEnabled &&
                (hasExistingFile
                  ? t("upload.alreadyUploaded", { name: getDisplayName() })
                  : props.id === "milatary-obligations-upload"
                  ? t("upload.declaration")
                  : contentStatus.charAt(0).toUpperCase() +
                    contentStatus.slice(1))}{" "}
              {!checkEnabled && hasUploadedFile && t("upload.selectedSuccess")}
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
