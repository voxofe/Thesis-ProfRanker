import React from "react";
import { useFormData } from "../../contexts/FormDataContext";
import InputField from "../InputField";

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
          label="Οδός / Διεύθυνση"
          id="street-address"
          name="street-address"
          type="text"
          value={formData.streetAddress}
          onChange={(value) => handleChange("streetAddress", value)}
          required={true}
        />
      </div>

      <div className="sm:col-span-1">
        <InputField
          label="Πόλη"
          id="city"
          name="city"
          type="text"
          value={formData.city}
          onChange={(value) => handleChange("city", value)}
          required={true}
        />
      </div>

      <div className="sm:col-span-1">
        <InputField
          label="Ταχυδρομικός κώδικας"
          id="postal-code"
          name="postal-code"
          type="text"
          value={formData.postalCode}
          onChange={(value) => handleChange("postalCode", value)}
          required={true}
        />
      </div>
    </div>
  );
}