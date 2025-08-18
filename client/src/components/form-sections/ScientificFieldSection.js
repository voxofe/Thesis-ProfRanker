import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
import InputField from "../InputField";
import Upload from "../Upload";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Tooltip from "../Tooltip";

const TOURISM_COURSES = [
  {
    title: "Διοίκηση Τουριστικών Επιχειρήσεων",
    description:
      "Εισαγωγή στις αρχές διοίκησης και λειτουργίας τουριστικών επιχειρήσεων, στρατηγικός σχεδιασμός και διαχείριση ανθρώπινων πόρων.",
  },
  {
    title: "Τουριστική Πολιτική και Ανάπτυξη",
    description:
      "Μελέτη των πολιτικών τουριστικής ανάπτυξης, βιώσιμος τουρισμός και επιπτώσεις στην τοπική οικονομία και κοινωνία.",
  },
  {
    title: "Διαδικτυακό Μάρκετινγκ στον Τουρισμό",
    description:
      "Σύγχρονες τεχνικές ψηφιακού μάρκετινγκ για τουριστικές επιχειρήσεις, social media, SEO και online booking platforms.",
  },
  {
    title: "Βιώσιμος Τουρισμός",
    description:
      "Αρχές και πρακτικές βιώσιμης τουριστικής ανάπτυξης, περιβαλλοντική προστασία και κοινωνική ευθύνη.",
  },
];

const ENGLISH_COURSES = [
  {
    title: "Αγγλική Γραμματεία και Φιλολογία",
    description:
      "Μελέτη της αγγλικής λογοτεχνίας από την κλασική περίοδο έως τη σύγχρονη εποχή, ανάλυση κειμένων και λογοτεχνικών κινημάτων.",
  },
  {
    title: "Σύγχρονη Αγγλική Γλώσσα",
    description:
      "Εμβάθυνση στη σύγχρονη αγγλική γλώσσα, γραμματική, σύνταξη, λεξιλόγιο και γλωσσολογικές θεωρίες.",
  },
  {
    title: "Αγγλικός Πολιτισμός και Ιστορία",
    description:
      "Διερεύνηση του αγγλοσαξονικού πολιτισμού, ιστορία, παραδόσεις και κοινωνικές εξελίξεις.",
  },
  {
    title: "Μεθοδολογία Διδασκαλίας Αγγλικών",
    description:
      "Σύγχρονες μέθοδοι διδασκαλίας της αγγλικής γλώσσας, εκπαιδευτικά εργαλεία και αξιολόγηση μάθησης.",
  },
];

export default function ScientificFieldSection() {
  const { formData, handleChange, handleFileChange, handleFileDelete } =
    useFormData();

  return (
    <div className="space-y-6">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto">
        {/* Left Column - Scientific Field Selection */}
        <div className="h-full flex flex-col">
          <div className="flex-1 flex flex-col space-y-4">
            {/* Scientific Field Dropdown */}
            <div className="flex-shrink-0">
              <InputField
                label="Επιστημονικό Πεδίο"
                id="scientific-field"
                name="scientific-field"
                optns={[
                  { label: "Τουρισμός", value: "Τουρισμός" },
                  { label: "Αγγλικά", value: "Αγγλικά" },
                ]}
                isDropdown={true}
                value={formData.scientificField}
                onChange={(value) => handleChange("scientificField", value)}
                required={true}
              />
            </div>

            {/* Courses List - Takes remaining space */}
            <div className="flex-1 flex flex-col min-h-0">
              <label
                htmlFor="course-list"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Μαθήματα του Επιστημονικού Πεδίου
              </label>
              <div
                id="course-list"
                className="w-full overflow-y-auto rounded-md border border-gray-300 bg-white p-4 text-gray-700 h-64"
              >
                {formData.scientificField ? (
                  <div className="space-y-2">
                    <ul className="space-y-2">
                      {formData.scientificField === "Τουρισμός" ? (
                        <>
                          {TOURISM_COURSES.map((course, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between p-2 bg-yellow-50 rounded border-l-4 border-yellow-200 group"
                            >
                              <span className="text-sm flex-1">
                                {course.title}
                              </span>
                              <Tooltip content={course.description}>
                                <InformationCircleIcon className="h-4 w-4 text-yellow-600 cursor-help ml-2 flex-shrink-0 hover:text-yellow-700 transition-colors" />
                              </Tooltip>
                            </li>
                          ))}
                        </>
                      ) : formData.scientificField === "Αγγλικά" ? (
                        <>
                          {ENGLISH_COURSES.map((course, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between p-2 bg-yellow-50 rounded border-l-4 border-yellow-200 group"
                            >
                              <span className="text-sm flex-1">
                                {course.title}
                              </span>
                              <Tooltip content={course.description}>
                                <InformationCircleIcon className="h-4 w-4 text-yellow-600 cursor-help ml-2 flex-shrink-0 hover:text-yellow-700 transition-colors" />
                              </Tooltip>
                            </li>
                          ))}
                        </>
                      ) : null}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-sm">
                        Παρακαλώ επιλέξτε επιστημονικό πεδίο
                      </div>
                      <div className="text-xs mt-1">
                        για να δείτε τα διαθέσιμα μαθήματα
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Course Plan Upload */}
        <div className="rounded-lg h-full flex flex-col">
          <div className="flex-1 flex flex-col justify-center">
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
                onChange={(e) => handleFileChange("coursePlanDocument", e)}
                onDelete={() => handleFileDelete("coursePlanDocument")}
                required={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
