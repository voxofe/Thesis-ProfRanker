import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { usePositions } from "../contexts/PositionsContext";
import InputField from "../components/InputField";
import PositionSelect from "../components/PositionSelect";

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
  const { positions = [], loading: positionsLoading } = usePositions();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
  });
  const [preferredPositionId, setPreferredPositionId] = useState("");
  const [documents, setDocuments] = useState({});
  const [docFiles, setDocFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDocs, setSavingDocs] = useState(false);
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
        });
        setDocuments(data?.documents || {});
      })
      .catch((error) => {
        console.error("Error loading profile:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!profile || positionsLoading || positions.length === 0) return;

    const preferredFieldId = profile?.preferredScientificFieldId;
    const fallbackPositionId = currentUser?.form?.positionId;

    const preferredPos = positions.find(
      (pos) => String(pos.scientificFieldId) === String(preferredFieldId)
    );
    const fallbackPos = positions.find(
      (pos) => String(pos.id) === String(fallbackPositionId)
    );

    const selected = preferredPos || fallbackPos;
    if (selected) {
      setPreferredPositionId(String(selected.id));
    }
  }, [profile, positionsLoading, positions, currentUser?.form?.positionId]);

  const applications = useMemo(
    () => (profile?.applications && Array.isArray(profile.applications) ? profile.applications : []),
    [profile]
  );

  const isApplicant = currentUser?.role === "applicant";

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem("token");
    const selectedPosition = positions.find(
      (pos) => String(pos.id) === String(preferredPositionId)
    );

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      gender: form.gender || null,
      preferredScientificFieldId: selectedPosition?.scientificFieldId || null,
    };

    try {
      const response = await axios.put(`${API_BASE_URL}/api/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      setDocuments(response.data?.documents || {});
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

  const handleDocChange = (key, file) => {
    setDocFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleSaveDocuments = async () => {
    setSavingDocs(true);
    setMessage(null);
    const token = localStorage.getItem("token");
    const formData = new FormData();

    const fieldMap = {
      cv: "cvDocument",
      phd: "phdDocument",
      doatap: "doatapDocument",
      coursePlan: "coursePlanDocument",
      military: "militaryObligationsDocument",
    };

    Object.entries(fieldMap).forEach(([key, fieldName]) => {
      if (docFiles[key]) {
        formData.append(fieldName, docFiles[key]);
      }
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/profile/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProfile(response.data);
      setDocuments(response.data?.documents || {});
      setDocFiles({});
      setMessage({ type: "success", text: "Τα αρχεία αποθηκεύτηκαν." });
    } catch (error) {
      console.error("Error saving documents:", error);
      setMessage({
        type: "error",
        text: "Αποτυχία αποθήκευσης αρχείων.",
      });
    } finally {
      setSavingDocs(false);
    }
  };

  const handleDownload = async (downloadPath, name) => {
    if (!downloadPath) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}${downloadPath}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const documentItems = [
    { key: "cv", label: "Βιογραφικό" },
    { key: "phd", label: "Διδακτορικός τίτλος" },
    { key: "doatap", label: "ΔΟΑΤΑΠ" },
    { key: "coursePlan", label: "Σχεδιάγραμμα διδασκαλίας" },
    { key: "military", label: "Στρατιωτικές υποχρεώσεις" },
  ];

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
        <h2 className="text-lg font-semibold text-patras-buccaneer mb-4">Στοιχεία λογαριασμού</h2>
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
            id="gender"
            name="gender"
            label="Φύλο"
            isDropdown={true}
            optns={genderOptions}
            value={form.gender || ""}
            onChange={(value) => handleFieldChange("gender", value)}
          />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
          <div className="text-sm text-gray-500">
            Ρόλος: <span className="font-semibold text-gray-700">{profile?.user?.role}</span>
          </div>
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

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-patras-buccaneer mb-4">Προτιμώμενο επιστημονικό πεδίο</h2>
        <PositionSelect
          positions={positions}
          value={preferredPositionId}
          onChange={(value) => setPreferredPositionId(value)}
          label="Προτιμώμενο επιστημονικό πεδίο"
          disabled={positionsLoading}
          maxResults={50}
        />
        <p className="text-sm text-gray-500">
          Θα χρησιμοποιηθεί ως προεπιλογή σε μελλοντικές αιτήσεις.
        </p>
      </div>

      {isApplicant && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-patras-buccaneer mb-4">Θησαυροφυλάκιο δικαιολογητικών</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-patras-buccaneer">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">Έγγραφο</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">Αρχείο</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">Ενημέρωση</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documentItems.map((doc) => (
                  <tr key={doc.key}>
                    <td className="px-4 py-3 text-sm text-patras-buccaneer">{doc.label}</td>
                    <td className="px-4 py-3 text-sm text-patras-buccaneer">
                      {documents?.[doc.key]?.name ? (
                        <button
                          type="button"
                          onClick={() => handleDownload(documents[doc.key].downloadPath, documents[doc.key].name)}
                          className="underline text-patras-buccaneer hover:text-patras-sanguineBrown"
                        >
                          {documents[doc.key].name}
                        </button>
                      ) : (
                        "Δεν έχει υποβληθεί"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="file"
                        onChange={(e) => handleDocChange(doc.key, e.target.files?.[0])}
                        className="text-sm text-gray-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleSaveDocuments}
              disabled={savingDocs}
              className="inline-flex items-center justify-center bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors disabled:opacity-60"
            >
              {savingDocs ? "Αποθήκευση..." : "Αποθήκευση αρχείων"}
            </button>
          </div>
        </div>
      )}

      {isApplicant && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6" id="profile-applications">
          <h2 className="text-lg font-semibold text-patras-buccaneer mb-4">Ιστορικό αιτήσεων</h2>
          {applications.length === 0 ? (
            <p className="text-gray-500">Δεν υπάρχουν καταχωρημένες αιτήσεις.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-patras-buccaneer">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">Επιστημονικό πεδίο</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">Σχολή</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">Τμήμα</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">Ημερομηνία</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">Μόρια</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-4 py-3 text-sm text-patras-buccaneer">{app.scientificField || "—"}</td>
                      <td className="px-4 py-3 text-sm text-patras-buccaneer">{app.school || "—"}</td>
                      <td className="px-4 py-3 text-sm text-patras-buccaneer">{app.department || "—"}</td>
                      <td className="px-4 py-3 text-sm text-patras-buccaneer">{app.submitDate || "—"}</td>
                      <td className="px-4 py-3 text-sm text-patras-buccaneer">{app.totalPoints ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6" id="profile-settings">
        <h2 className="text-lg font-semibold text-patras-buccaneer mb-2">Ρυθμίσεις</h2>
        <p className="text-gray-500">Θα προστεθούν σύντομα επιπλέον ρυθμίσεις.</p>
      </div>
    </div>
  );
}
