const parseEnvBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return defaultValue;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return defaultValue;
};

export const EMAIL_VERIFICATION_ENABLED = parseEnvBoolean(
  process.env.REACT_APP_EMAIL_VERIFICATION_ENABLED,
  true
);
