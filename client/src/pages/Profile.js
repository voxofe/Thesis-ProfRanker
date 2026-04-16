import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

const genderOptions = [
  { value: "male", label: "Άνδρας" },
  { value: "female", label: "Γυναίκα" },
];

export default function Profile() {
  const { currentUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    mobileNumber: "",
    landlineNumber: "",
    streetAddress: "",
    city: "",
    postalCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setProfile(data);
        setForm({
          firstName: data?.user?.firstName || "",
          lastName: data?.user?.lastName || "",
          email: data?.user?.email || "",
          gender: data?.user?.gender || "",
          mobileNumber: data?.user?.mobileNumber || "",
          landlineNumber: data?.user?.landlineNumber || "",
          streetAddress: data?.user?.streetAddress || "",
          city: data?.user?.city || "",
          postalCode: data?.user?.postalCode || "",
        });
      })
      .catch((error) => {
        console.error("Error loading profile:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const isApplicant = currentUser?.role === "applicant";

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem("token");

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      gender: form.gender || null,
      mobileNumber: form.mobileNumber || "",
      landlineNumber: form.landlineNumber || "",
      streetAddress: form.streetAddress || "",
      city: form.city || "",
      postalCode: form.postalCode || "",
    };

    try {
      const response = await axios.put(`${API_BASE_URL}/api/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      setMessage({ type: "success", text: "Οι αλλαγές αποθηκεύτηκαν." });
      refreshUser();
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({
        type: "error",
        text: error?.response?.data?.error || "Αποτυχία αποθήκευσης.",
      });
    } finally {
      setSaving(false);
    }
  };

  const latestForm = currentUser?.form || {};
  const workExperienceYears = latestForm.workExperience ?? null;

  const renderFilePills = (files) => (
    <div className="flex flex-wrap gap-2">
      {files.map((file, index) => (
        <span
          key={`${file}-${index}`}
          className="inline-flex items-center bg-patras-buccaneer/10 text-patras-buccaneer px-3 py-1 rounded-full text-xs font-medium border border-patras-buccaneer"
        >
          {file}
        </span>
      ))}
    </div>
  );

  const vaultItems = useMemo(() => {
    const items = [];
    const single = (label, name) => {
      if (name) items.push({ label, files: [name] });
    };
    const multi = (label, list) => {
      const files = Array.isArray(list)
        ? list.filter((item) => !!item)
        : [];
      if (files.length) items.push({ label, files });
    };

    single("Βιογραφικό σημείωμα", latestForm.cvDocument);
    multi(
      "Έγγραφα που τεκμηριώνουν τα διαλαμβανόμενα στο βιογραφικό",
      latestForm.bioSupportingDocuments
    );
    single("Διδακτορικό δίπλωμα", latestForm.phdDocument);
    single("ΔΟΑΤΑΠ", latestForm.doatapDocument);
    multi(
      "Βεβαιώσεις προϋπηρεσίας από τον Φορέα / Συμβάσεις",
      latestForm.employmentCertificates
    );
    single("Υπεύθυνη δήλωση", latestForm.responsibleDeclarationDocument);
    single(
      "Βεβαίωση άδειας από Δημόσια Υπηρεσία",
      latestForm.publicEmployeePermissionDocument
    );
    single(
      "Υπεύθυνη δήλωση μη συμμετοχής",
      latestForm.notParticipatedDeclarationDocument
    );
    single(
      "Πιστοποιητικό ελληνομάθειας",
      latestForm.euCitizenGreekLanguageCertificateDocument
    );
    single(
      "Βεβαίωση στρατιωτικών υποχρεώσεων",
      latestForm.militaryObligationsDocument
    );

    return items;
  }, [latestForm]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-y-5 pt-5">
        <p className="text-center text-gray-600">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-700">Το προφίλ μου</h1>
        <p className="text-gray-500 mt-1">
          Οι αλλαγές εδώ δεν τροποποιούν τις ήδη υποβληθείσες αιτήσεις.
        </p>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-md text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-patras-buccaneer mb-4">Στοιχεία χρήστη</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            id="firstName"
            name="firstName"
            label="Όνομα"
            type="text"
            value={form.firstName}
            onChange={(value) => handleFieldChange("firstName", value)}
          />
          <InputField
            id="lastName"
            name="lastName"
            label="Επώνυμο"
            type="text"
            value={form.lastName}
            onChange={(value) => handleFieldChange("lastName", value)}
          />
          <InputField
            id="email"
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => handleFieldChange("email", value)}
          />
          <InputField
            id="mobileNumber"
            name="mobileNumber"
            label="Κινητό τηλέφωνο"
            type="text"
            value={form.mobileNumber}
            onChange={(value) => handleFieldChange("mobileNumber", value)}
          />
          <InputField
            id="landlineNumber"
            name="landlineNumber"
            label="Σταθερό τηλέφωνο"
            type="text"
            value={form.landlineNumber}
            onChange={(value) => handleFieldChange("landlineNumber", value)}
          />
          <InputField
            id="streetAddress"
            name="streetAddress"
            label="Οδός και αριθμός"
            type="text"
            value={form.streetAddress}
            onChange={(value) => handleFieldChange("streetAddress", value)}
          />
          <InputField
            id="city"
            name="city"
            label="Πόλη"
            type="text"
            value={form.city}
            onChange={(value) => handleFieldChange("city", value)}
          />
          <InputField
            id="postalCode"
            name="postalCode"
            label="Τ.Κ."
            type="text"
            value={form.postalCode}
            onChange={(value) => handleFieldChange("postalCode", value)}
          />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center justify-center bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors disabled:opacity-60"
          >
            {saving ? "Αποθήκευση..." : "Αποθήκευση αλλαγών"}
          </button>
        </div>
      </div>

      {isApplicant && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-patras-buccaneer mb-4">
            Μεταδιδακτορική εργασιακή εμπειρία
          </h2>
          <div className="text-sm text-gray-700">
            Χρόνια μεταδιδακτορικής εργασιακής εμπειρίας (εξαιρείται η διδακτική εμπειρία):
            <span className="font-semibold text-patras-buccaneer ml-2">
              {workExperienceYears ?? "—"}
            </span>
          </div>
        </div>
      )}

      {isApplicant && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-patras-buccaneer mb-4">
            Θησαυροφυλάκιο δικαιολογητικών
          </h2>
          {vaultItems.length === 0 ? (
            <p className="text-gray-500">Δεν υπάρχουν καταχωρημένα δικαιολογητικά.</p>
          ) : (
            <div className="space-y-4">
              {vaultItems.map((item) => (
                <div key={item.label} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    {item.label}
                  </div>
                  {renderFilePills(item.files)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
