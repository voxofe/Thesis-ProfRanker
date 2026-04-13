import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
import InputField from "../InputField";
import Checkbox from "../Checkbox";

export default function PersonalInfoSection() {
  const { formData, handleChange } = useFormData();

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-3">
      <div className="sm:col-span-1">
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

      <div className="sm:col-span-1">
        <InputField
          label="Κινητό τηλέφωνο"
          id="phone-number"
          name="phone-number"
          type="text"
          value={formData.phoneNumber}
          onChange={(value) => handleChange("phoneNumber", value)}
          required={true}
        />
      </div>

      <div className="sm:col-span-1">
        <InputField
          label="Σταθερό τηλέφωνο"
          id="landline-number"
          name="landline-number"
          type="text"
          value={formData.landlineNumber}
          onChange={(value) => handleChange("landlineNumber", value)}
          required={false}
        />
      </div>

      <div className="sm:col-span-1">
        <InputField
          label="Διεύθυνση"
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={(value) => handleChange("address", value)}
          required={true}
        />
      </div>

      <div className="sm:col-span-3 pt-2">
        <Checkbox
          label="Είμαι δημόσιος υπάλληλος"
          id="is-public-employee"
          name="is-public-employee"
          checked={formData.isPublicEmployee}
          onChange={(value) => handleChange("isPublicEmployee", value)}
        />
      </div>
    </div>
  );
}