import React, { useState } from "react";
import { useFormData } from "../../contexts/FormDataContext";
import InputField from "../InputField";

export default function PersonalInfoSection() {
  const { formData, handleChange } = useFormData();
  const [errors, setErrors] = useState({});

  const normalizePhone = (value) => (value || "").replace(/[\s()-]/g, "");

  const validateField = (key, value) => {
    if (key === "phoneNumber") {
      if (!value.trim()) return "Το κινητό είναι υποχρεωτικό.";
      const mobile = normalizePhone(value);
      if (!/^69\d{8}$/.test(mobile)) {
        return "Ο αριθμός κινητού πρέπει να έχει 10 ψηφία και να ξεκινά από 69.";
      }
      return "";
    }
    if (key === "landlineNumber") {
      if (!value.trim()) return "";
      const landline = normalizePhone(value);
      if (!/^2\d{9}$/.test(landline)) {
        return "Ο αριθμός σταθερού πρέπει να έχει 10 ψηφία και να ξεκινά από 2.";
      }
      return "";
    }
    if (key === "postalCode") {
      if (!value.trim()) return "Ο Τ.Κ. είναι υποχρεωτικός.";
      if (!/^\d{5}$/.test(value.trim())) return "Ο Τ.Κ. πρέπει να έχει 5 ψηφία.";
      return "";
    }
    return "";
  };

  const handleValidatedChange = (key, value) => {
    handleChange(key, value);
    const error = validateField(key, value);
    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const handleValidatedBlur = (key, value) => {
    const error = validateField(key, value);
    setErrors((prev) => ({ ...prev, [key]: error }));
  };

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
          label="Οδός και αριθμός"
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
          onChange={(value) => handleValidatedChange("postalCode", value)}
          onBlur={() => handleValidatedBlur("postalCode", formData.postalCode)}
          required={true}
          error={errors.postalCode}
        />
      </div>

      <div className="sm:col-span-1">
        <InputField
          label="Κινητό τηλέφωνο"
          id="phone-number"
          name="phone-number"
          type="text"
          value={formData.phoneNumber}
          onChange={(value) => handleValidatedChange("phoneNumber", value)}
          onBlur={() => handleValidatedBlur("phoneNumber", formData.phoneNumber)}
          required={true}
          error={errors.phoneNumber}
        />
      </div>

      <div className="sm:col-span-1">
        <InputField
          label="Σταθερό τηλέφωνο"
          id="landline-number"
          name="landline-number"
          type="text"
          value={formData.landlineNumber}
          onChange={(value) => handleValidatedChange("landlineNumber", value)}
          onBlur={() => handleValidatedBlur("landlineNumber", formData.landlineNumber)}
          required={false}
          error={errors.landlineNumber}
        />
      </div>
    </div>
  );
}