import React, { useState } from "react";
import { useFormData } from "../../contexts/FormDataContext";
import { useLanguage } from "../../contexts";
import InputField from "../InputField";

export default function PersonalInfoSection() {
  const { formData, handleChange } = useFormData();
  const { t } = useLanguage();
  const [errors, setErrors] = useState({});

  const normalizePhone = (value) => (value || "").replace(/[\s()-]/g, "");

  const validateField = (key, value) => {
    if (key === "phoneNumber") {
      if (!value.trim()) return t("personalInfo.mobileRequired");
      const mobile = normalizePhone(value);
      if (!/^69\d{8}$/.test(mobile)) {
        return t("personalInfo.mobileInvalid");
      }
      return "";
    }
    if (key === "landlineNumber") {
      if (!value.trim()) return "";
      const landline = normalizePhone(value);
      if (!/^2\d{9}$/.test(landline)) {
        return t("personalInfo.landlineInvalid");
      }
      return "";
    }
    if (key === "postalCode") {
      if (!value.trim()) return t("personalInfo.postalRequired");
      if (!/^\d{5}$/.test(value.trim())) return t("personalInfo.postalInvalid");
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
          label={t("register.firstName")}
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
          label={t("register.lastName")}
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
          label={t("common.email")}
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
          label={t("personalInfo.streetAddress")}
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
          label={t("personalInfo.city")}
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
          label={t("personalInfo.postalCode")}
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
          label={t("personalInfo.mobile")}
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
          label={t("personalInfo.landline")}
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