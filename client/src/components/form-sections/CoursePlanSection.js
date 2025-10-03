import Upload from "../Upload";

export default function BioSection({ formData, handleFileChange, handleFileDelete }) {
  return (
    // Right Column - Course Plan Upload
    <div className="rounded-lg h-full flex flex-col">
      {/* <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          <div className="text-sm text-gray-600 bg-white p-4 rounded-md border border-gray-300">
            <strong>Οδηγίες σχεδιαγράμματος διδασκαλίας:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>
                • Ανεβάστε το σχεδιάγραμμα διδασκαλίας για όλα τα μαθήματα
              </li>
              <li>
                • Το αρχείο πρέπει να είναι σε μορφή PDF, DOC, DOCX ή ODT
              </li>
              <li>• Περιλάβετε λεπτομερή περιγραφή της μεθοδολογίας</li>
            </ul>
          </div>

          <Upload
            icon="document-text"
            label="Σχεδιάγραμμα Διδασκαλίας"
            content="το σχεδιάγραμμα διδασκαλίας"
            id="course-plan-upload"
            name="course-plan-upload"
            accept=".pdf,.doc,.docx, .odt"
            uploadedFile={formData.coursePlanDocument}
            onChange={e => handleFileChange("coursePlanDocument", e)}
            onDelete={() => handleFileDelete("coursePlanDocument")}
            required={true}
          />
        </div>
      </div> */}
    </div>
  );
}