import React, { useMemo, useRef, useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import CustomSelect from "./CustomSelect";

const getDisplayName = (fileItem) => {
  if (fileItem instanceof File) return fileItem.name;
  if (typeof fileItem === "string") return fileItem;
  if (fileItem?.name) return fileItem.name;
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

const getDisplaySize = (fileItem) => {
  if (fileItem instanceof File) return formatFileSize(fileItem.size);
  return "";
};

export default function MultipleUploadStrip({
  files = [],
  onAddFile,
  onDeleteFile,
  onChange,
  onDelete,
  existingOptions = [],
  accept = ".pdf,.doc,.docx,.odt",
  required = false,
  label,
}) {
  const inputRef = useRef(null);
  const [localFiles, setLocalFiles] = useState([]);
  const [error, setError] = useState("");
  const [showVaultPicker, setShowVaultPicker] = useState(false);
  const maxFileBytes = 5 * 1024 * 1024;
  const addFileHandler = onAddFile || onChange;
  const deleteFileHandler = onDeleteFile || onDelete;
  const effectiveFiles = useMemo(() => {
    if (Array.isArray(files) && files.length > 0) return files;
    return localFiles;
  }, [files, localFiles]);
  const selectedIds = new Set(
    effectiveFiles
      .map((fileItem) =>
        fileItem && typeof fileItem === "object" && fileItem.id
          ? String(fileItem.id)
          : null
      )
      .filter(Boolean)
  );
  const selectedNames = new Set(
    effectiveFiles.map((fileItem) => getDisplayName(fileItem)).filter(Boolean)
  );
  const selectableOptions = Array.isArray(existingOptions)
    ? existingOptions.filter(
        (option) =>
          option &&
          option.id &&
          option.name &&
          !selectedIds.has(String(option.id)) &&
          !selectedNames.has(option.name)
      )
    : [];

  const parseAcceptList = () =>
    (accept || "")
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
    if (!accept) return "Μη αποδεκτός τύπος αρχείου.";
    return `Επιτρέπονται μόνο: ${accept.replace(/\s+/g, "")}`;
  };

  const getSizeErrorMessage = () => "Μέγιστο μέγεθος αρχείου: 5MB.";

  const handleFilePick = (event) => {
    const incoming = Array.from(event.target.files || []);
    let hasValidationError = false;

    incoming.forEach((file) => {
      if (!isFileAllowed(file)) {
        hasValidationError = true;
        setError(getAcceptErrorMessage());
        return;
      }
      if (file.size > maxFileBytes) {
        hasValidationError = true;
        setError(getSizeErrorMessage());
        return;
      }

      setLocalFiles((prev) => [...prev, file]);
      if (typeof addFileHandler === "function") {
        addFileHandler(file);
      }
    });

    if (!hasValidationError) {
      setError("");
    }

    event.target.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm/6 font-medium text-gray-900 dark:text-[var(--color-text-primary)]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
        {effectiveFiles.map((file, index) => (
          <div
            key={`${getDisplayName(file)}-${index}`}
            className="relative h-40 w-40 shrink-0 rounded-lg border-2 border-patras-buccaneer dark:border-[var(--color-border-accent)] bg-white dark:bg-[var(--color-bg-card)] p-3"
          >
            <TrashIcon
              className="absolute right-2 top-2 h-5 w-5 cursor-pointer text-gray-400 dark:text-[var(--color-text-muted)] hover:text-red-700 dark:hover:text-red-500"
              onClick={() => {
                setLocalFiles((prev) =>
                  prev.filter((_, currentIndex) => currentIndex !== index)
                );
                setError("");
                if (typeof deleteFileHandler === "function") {
                  deleteFileHandler(index);
                }
              }}
            />
            <div className="flex h-full flex-col items-center justify-center text-center">
              <DocumentTextIcon className="h-10 w-10 text-patras-buccaneer dark:text-[var(--color-text-secondary)]" />
              <p className="mt-2 line-clamp-3 break-all text-xs text-gray-700 dark:text-[var(--color-text-secondary)]">
                {getDisplayName(file)}
                {file instanceof File && (
                  <span className="text-gray-500 dark:text-[var(--color-text-muted)]"> ({getDisplaySize(file)})</span>
                )}
              </p>
            </div>
          </div>
        ))}

        <div className="relative h-40 w-40 shrink-0 rounded-lg border border-dashed border-patras-buccaneer/40 dark:border-[var(--color-border-accent)] bg-white dark:bg-[var(--color-bg-card)] text-patras-buccaneer dark:text-[var(--color-text-secondary)]">
          {!showVaultPicker && (
            <button
              type="button"
              className="flex h-full w-full items-center justify-center hover:bg-patras-albescentWhite dark:hover:bg-[var(--color-bg-muted)]"
              onClick={() => {
                if (selectableOptions.length === 0) {
                  inputRef.current?.click();
                  return;
                }
                setShowVaultPicker(true);
              }}
            >
              <PlusIcon className="h-12 w-12" />
            </button>
          )}

          {showVaultPicker && selectableOptions.length > 0 && (
            <div className="p-3">
              <CustomSelect
                label="Επιλέξτε από τα ήδη αναρτημένα αρχεία σας"
                value="select"
                placeholder="Επιλέξτε..."
                options={[
                  ...selectableOptions.map((option) => ({
                    value: String(option.id),
                    label: option.name,
                  })),
                  { value: "__new__", label: "Ανέβασμα νέου αρχείου" },
                ]}
                onChange={(value) => {
                  if (value === "__new__") {
                    setShowVaultPicker(false);
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
                    const fileEntry = { id: selected.id, name: selected.name };
                    setLocalFiles((prev) => [...prev, fileEntry]);
                    if (typeof addFileHandler === "function") {
                      addFileHandler(fileEntry);
                    }
                  }
                  setShowVaultPicker(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple
        onChange={handleFilePick}
      />
      <p className="text-xs/5 text-gray-600 dark:text-[var(--color-text-secondary)]">
        PDF, DOC, DOCX, ODT · Μέγιστο μέγεθος: 5MB
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}