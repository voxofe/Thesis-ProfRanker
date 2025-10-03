import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PapersDrawer from "../components/PapersDrawer";
import CoursesDrawer from "../components/CoursesDrawer";
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";
import { usePositions } from "../contexts/PositionsContext";

export default function ApplicantScorePage() {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const { positions = [] } = usePositions();
  const [applicantData, setApplicantData] = useState();
  const [loading, setLoading] = useState(false);

  // const fmtDate = (d) => {
  //   if (!d) return "";
  //   const dt = typeof d === "string" ? new Date(d) : d;
  //   return dt.toLocaleDateString("el-GR", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   });
  // };

  useEffect(() => {
    if (id && currentUser) {
      setLoading(true);
      const token = localStorage.getItem("token");
      axios
        .get(`http://127.0.0.1:8000/api/applicant/${id}?times=10`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setApplicantData(res.data))
        .catch((err) => console.error("Error fetching applicant data:", err))
        .finally(() => setLoading(false));
    }
  }, [id, currentUser]);

  // Try to resolve position info (school, courses) by scientificField name (fallback to data if present)
  const matchedPosition = useMemo(() => {
    const sf = applicantData?.scientificField;
    if (!sf) return null;
    return positions.find((p) => p.scientificField === sf) || null;
  }, [positions, applicantData?.scientificField]);

  // Normalize to DD-MM-YYYY (accepts "DD-MM-YYYY", "DD-MM-YYYY HH:MM", ISO strings, or Date)
  const toDDMMYYYY = (v) => {
    if (!v) return "";
    if (typeof v === "string") {
      const m = v.match(/^(\d{2})-(\d{2})-(\d{4})/);
      if (m) return `${m[1]}-${m[2]}-${m[3]}`; // already formatted, strip time if any
      const d = new Date(v);
      if (!isNaN(d)) {
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      }
      return v;
    }
    if (v instanceof Date && !isNaN(v)) {
      const dd = String(v.getDate()).padStart(2, "0");
      const mm = String(v.getMonth() + 1).padStart(2, "0");
      const yyyy = v.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    return "—";
  };

  const schoolName = applicantData?.school || matchedPosition?.school || "—";
  const departmentName = applicantData?.department || matchedPosition?.department || "—";

  const courses = useMemo(() => {
    if (Array.isArray(applicantData?.courses) && applicantData.courses.length)
      return applicantData.courses;
    if (Array.isArray(matchedPosition?.courses)) return matchedPosition.courses;
    return [];
  }, [applicantData?.courses, matchedPosition?.courses]);

  // Prefer server-formatted fields from views.py
  const startDate = applicantData?.positionStartDate || matchedPosition?.startDate || "";
  const endDate = applicantData?.positionEndDate || matchedPosition?.endDate || "";
  const submitDate =
    applicantData?.submitDate ||
    applicantData?.submittedAt ||
    applicantData?.submissionDate ||
    "";

  const postdocYears =
    applicantData?.workExperienceYears ??
    applicantData?.postdocYears ??
    applicantData?.yearsOfPostdoc ??
    null;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-y-5 pt-5">
        <p className="text-center text-gray-600">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-y-5 pt-5">
      <h1 className="text-2xl text-center border-b pb-2 text-gray-700">
        Αποτελέσματα αίτησης υποψηφίου
      </h1>

      {/* Applicant Info Section */}
      <div>
        <h1 className="text-xl font-light mb-3">Στοιχεία υποψηφίου</h1>
        <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50 mb-5">
          <table className="min-w-full bg-white/25">
            <thead className="bg-patras-buccaneer">
              <tr>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Όνομα
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Επώνυμο
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Διδακτορικός Τίτλος
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Ημερομηνία λήψης Διδακτορικού Τίτλου
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">
                  Mεταδιδακτορική εργασιακή εμπειρία
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                  {applicantData?.firstName}
                </td>
                <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                  {applicantData?.lastName}
                </td>
                <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                  {applicantData?.phdTitle}
                </td>
                <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                  {toDDMMYYYY(applicantData?.phdAcquisitionDate)}
                </td>
                <td className="px-6 py-4 text-patras-buccaneer text-center align-middle">
                  {applicantData?.workExperience
                    ? `${applicantData?.workExperience} ${
                        applicantData?.workExperience === 1
                          ? "χρόνος"
                          : "χρόνια"
                      }`
                    : "Καμία"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Position Info Section */}
        <h1 className="text-xl font-light mb-3">Στοιχεία θέσης</h1>
        <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50 mb-5">
          <table className="min-w-full bg-white/25">
            <thead className="bg-patras-buccaneer">
              <tr>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Σχολή
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Τμήμα
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Επιστημονικό Πεδίο
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Έναρξη Αιτήσεων
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Λήξη Αιτήσεων
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider border-r border-patras-albescentWhite">
                  Υποβολή Αίτησης
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">
                  Μαθήματα
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                  {schoolName}
                </td>
                <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                  {departmentName}
                </td>
                <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite">
                  {applicantData?.scientificField || "—"}
                </td>
                <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                  {toDDMMYYYY(startDate)}
                </td>
                <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                  {toDDMMYYYY(endDate)}
                </td>
                <td className="px-6 py-4 text-patras-buccaneer text-center align-middle border-r border-patras-albescentWhite whitespace-nowrap">
                  {toDDMMYYYY(submitDate)}
                </td>
                <td className="px-6 py-4 text-center align-middle">
                  <CoursesDrawer
                    courses={courses}
                    scientificField={applicantData?.scientificField || matchedPosition?.scientificField}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Scores Section */}
        <h1 className="text-xl font-light mb-3">Βαθμολόγηση υποψηφίου</h1>
        <div className="overflow-x-auto shadow-md rounded-lg border border-patras-capePalliser/50">
          <table className="min-w-full bg-white/50">
            <thead className="bg-patras-buccaneer">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Κριτήριο
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Βαθμολόγηση
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-patras-cameo">
              <tr className="">
                <td className="px-6 py-4 text-patras-buccaneer">
                  Συνάφεια σχεδιαγράμματος διδασκαλίας και καινοτόμων
                  μεθοδολογιών/θεωριών & βιβλιογραφίας με την περιγραφή του
                  συνόλου των μαθημάτων του Επιστημονικού Πεδίου
                </td>
                <td className="px-6 py-4 text-center text-patras-buccaneer">
                  {applicantData?.coursePlanRelevancePoints}
                </td>
              </tr>
              <tr className="">
                <td className="px-6 py-4 text-patras-buccaneer">
                  Δομή, οργάνωση, κατανομή ύλης
                </td>
                <td className="px-6 py-4 text-center text-patras-buccaneer">
                  {applicantData?.courseMaterialStructurePoints}
                </td>
              </tr>
              <tr className="">
                <td className="px-6 py-4 text-patras-buccaneer">
                  Συνάφεια διδακτορικής διατριβής/δημοσιευμένου έργου με το
                  επιστημονικό πεδίο
                </td>
                <td className="px-6 py-4 text-center text-patras-buccaneer">
                  {applicantData?.thesisRelevancePoints}
                </td>
              </tr>
              <tr className="">
                <PapersDrawer papers={applicantData?.papers || []} />
                <td className="px-6 py-4 text-center text-patras-buccaneer">
                  {applicantData?.paperPoints}
                </td>
              </tr>
              <tr className="">
                <td className="px-6 py-4 text-patras-buccaneer">
                  Μεταδιδακτορική εργασιακή εμπειρία
                </td>
                <td className="px-6 py-4 text-center text-patras-buccaneer">
                  {applicantData?.workExperiencePoints}
                </td>
              </tr>
              <tr className="">
                <td className="px-6 py-4 text-patras-buccaneer">
                  Προσαύξηση κατά 20% επί της συνολικής βαθμολογίας της
                  υποψηφιότητας, εφόσον ο υποψήφιος δεν έχει επιλεγεί σε άλλο
                  πρόγραμμα Απόκτησης Ακαδημαϊκής Διδακτικής Εμπειρίας, στο
                  πλαίσιο των προηγούμενων προσκλήσεων ΕΔΒΜ 20 (ακαδ. έτος
                  2016‐2017), ΕΔΒΜ 45 (ακαδ. έτος 2017‐2018), ΕΔΒΜ 82 (ακαδ.
                  έτος 2018‐2019), καθώς και της ΕΔΒΜ 96 (ακαδ. έτη 2019‐2020
                  και 2020‐2021) του ΕΠ ΑΝΑΔ ΕΔΒΜ 2014‐2020
                </td>
                <td className="px-6 py-4 text-center text-patras-buccaneer">
                  {applicantData?.notPastProgramPoints}
                </td>
              </tr>
              <tr className="bg-patras-buccaneer font-semibold bg-wh">
                <td className="px-6 py-4 text-white">Σύνολικά Μόρια</td>
                <td className="px-6 py-4 text-center text-white">
                  {applicantData?.totalPoints}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
