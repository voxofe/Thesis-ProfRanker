import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
import InputField from "../InputField";
import Upload from "../Upload";

export default function PersonalInfoSection() {
  const { formData, handleChange, handleFileChange, handleFileDelete } =
    useFormData();

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-3">
      <div className="sm:col-span-1">
        {/* First Name */}
        <InputField
          disabled
          label="Όνομα"
          id="first-name"
          name="first-name"
          type="text"
          autoComplete="given-name"
          value={formData.firstName}
          onChange={(value) => handleChange("firstName", value)}
          required={true}
        />
      </div>
      <div className="sm:col-span-1">
        {/* Last Name */}
        <InputField
          disabled
          label="Επώνυμο"
          id="last-name"
          name="last-name"
          type="text"
          autoComplete="family-name"
          value={formData.lastName}
          onChange={(value) => handleChange("lastName", value)}
          required={true}
        />
      </div>
      <div className="sm:col-span-1">
        {/* Email */}
        <InputField
          disabled
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(value) => handleChange("email", value)}
          required={true}
        />
      </div>

      <div className="sm:col-span-3">
        {/* CV Upload*/}
        <Upload
          icon="document-text"
          label="Βιογραφικό Σημείωμα"
          content="τo βιογραφικό σας"
          id="cv-upload"
          name="cv-upload"
          accept=".pdf,.doc,.docx, .odt"
          uploadedFile={formData.cvDocument}
          onChange={(e) => handleFileChange("cvDocument", e)}
          onDelete={() => handleFileDelete("cvDocument")}
          required={true}
        />
      </div>
    </div>
  );
}
