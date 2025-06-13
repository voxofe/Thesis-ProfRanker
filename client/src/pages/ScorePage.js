import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PapersDrawer from '../components/PapersDrawer';

export default function ScorePage({ role, data }) {
    const { id } = useParams(); // Get the applicant ID from the URL
    const [applicantData, setApplicantData] = useState(null);
    const [papers, setPapers] = useState([]); 

    console.log("fuck")

    useEffect(() => {
        if (role === 'applicant' && id) {
            // Fetch applicant data by ID
            axios
                .get(`http://127.0.0.1:8000/api/applicant/${id}/`)
                .then((response) => {
                    setApplicantData(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching applicant data:', error);
                });

            // Fetch papers for the applicant
            axios
                .get(`http://127.0.0.1:8000/api/applicant/${id}/papers/`)
                .then((response) => {
                    setPapers(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching papers:', error);
                });
        }
    }, [role, id]);

    if (role === 'applicant' && !applicantData) {
        return <p>Loading...</p>; // Show a loading state while fetching data
    }

    return (
        <div className="grid grid-cols-1 gap-y-5 pt-5">
            <h1 className="text-2xl font-light border-b pb-5">
                {role === 'admin' ? 'Λίστα Κατάταξης Υποψηφίων' : 'Αποτελέσματα αίτησης'}
            </h1>

            {role === 'admin' ? (
                // Admin View: Full list of applicants
                <div className="overflow-x-auto shadow-md rounded-lg border border-patras-albescentWhite">
                    <table className="min-w-full bg-[#fffbf6]">
                        <thead className="bg-patras-buccaneer">
                            <tr className=''>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-white tuppercase tracking-wider">
                                    Όνομα
                                </th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">
                                    Επώνυμο
                                </th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">
                                    Βαθμολόγηση (σε μόρια)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-patras-cameo">
                            {data.map((applicant) => (
                                <tr key={applicant.id} className="hover:bg-patras-albescentWhite">
                                    <td className="px-6 py-4 text-center text-patras-buccaneer">{applicant.firstName}</td>
                                    <td className="px-6 py-4 text-center text-patras-buccaneer">{applicant.lastName}</td>
                                    <td className="px-6 py-4 text-center text-patras-buccaneer">{applicant.totalPoints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Applicant View
                <div>
                    {/* Applicant Info Section */}
                    <h1 className="text-xl font-light mb-3">Στοιχεία υποψηφίου</h1>
                    <div className="overflow-x-auto shadow-md rounded-lg border border-patras-albescentWhite mb-5">
                        <table className="min-w-full bg-[#fffbf6]">
                            <thead className="bg-patras-buccaneer">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Όνομα
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Επώνυμο
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Επιστημονικό Πεδίο
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Ημερομηνία λήψης Διδακτορικού Τίτλου
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Mεταδιδακτορική εργασιακή εμπειρία
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="text-center">
                                    <td className="px-6 py-4 text-patras-buccaneer">{applicantData.first_name}</td>
                                    <td className="px-6 py-4 text-patras-buccaneer">{applicantData.last_name}</td>
                                    <td className="px-6 py-4 text-patras-buccaneer">{applicantData.scientific_field}</td>
                                    <td className="px-6 py-4 text-patras-buccaneer">{applicantData.phd_acquisition_date}</td>
                                    <td className="px-6 py-4 text-patras-buccaneer">{applicantData.work_experience 
                                                                                        ? `${applicantData.work_experience} ${applicantData.work_experience === 1 ? "χρόνος" : "χρόνια"}`
                                                                                        : "Καμία"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Scores Section */}
                    <h1 className="text-xl font-light mb-3">Βαθμολόγηση υποψηφίου</h1>
                    <div className="overflow-x-auto shadow-md rounded-lg border border-patras-albescentWhite">
                        <table className="min-w-full bg-[#fffbf6]">
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
                                <tr className="hover:bg-patras-albescentWhite">
                                    <td className="px-6 py-4 text-patras-buccaneer">Συνάφεια σχεδιαγράμματος διδασκαλίας και 
                                        καινοτόμων μεθοδολογιών/θεωριών & βιβλιογραφίας με την 
                                        περιγραφή του συνόλου των μαθημάτων του Επιστημονικού Πεδίου</td>
                                    <td className="px-6 py-4 text-center text-patras-buccaneer">{applicantData.course_plan_relevance_points}</td>
                                </tr>
                                <tr className="hover:bg-patras-albescentWhite">
                                    <td className="px-6 py-4 text-patras-buccaneer">Δομή, οργάνωση, κατανομή ύλης</td>
                                    <td className="px-6 py-4 text-center text-patras-buccaneer">{applicantData.course_material_structure_points}</td>
                                </tr>
                                <tr className="hover:bg-patras-albescentWhite">
                                    <td className="px-6 py-4 text-patras-buccaneer">Συνάφεια διδακτορικής διατριβής/δημοσιευμένου έργου με το 
                                        επιστημονικό πεδίο</td>
                                    <td className="px-6 py-4 text-center text-patras-buccaneer">{applicantData.thesis_relevance_points}</td>
                                </tr>
                                <tr className="hover:bg-patras-albescentWhite">
                                    <PapersDrawer papers={papers} />
                                    {/* <td className="px-6 py-4 text-patras-buccaneer">Δημοσιεύσεις/Ανακοινώσεις σε συνέδρια</td> */}
                                    <td className="px-6 py-4 text-center text-patras-buccaneer">{applicantData.paper_points}</td>
                                    
                                </tr>
                                <tr className="hover:bg-patras-albescentWhite">
                                    <td className="px-6 py-4 text-patras-buccaneer">Μεταδιδακτορική εργασιακή εμπειρία</td>
                                    <td className="px-6 py-4 text-center text-patras-buccaneer">{applicantData.work_experience_points}</td>
                                </tr>
                                <tr className="hover:bg-patras-albescentWhite">
                                    <td className="px-6 py-4 text-patras-buccaneer">Προσαύξηση κατά 20% επί της συνολικής βαθμολογίας 
                                        της υποψηφιότητας, εφόσον ο υποψήφιος δεν έχει επιλεγεί σε 
                                        άλλο πρόγραμμα Απόκτησης Ακαδημαϊκής Διδακτικής Εμπειρίας, 
                                        στο πλαίσιο των προηγούμενων προσκλήσεων ΕΔΒΜ 20 (ακαδ. 
                                        έτος 2016‐2017), ΕΔΒΜ 45 (ακαδ. έτος 2017‐2018), ΕΔΒΜ 82 (ακαδ. 
                                        έτος 2018‐2019), καθώς και της ΕΔΒΜ 96 (ακαδ. έτη 2019‐2020 και 
                                        2020‐2021) του ΕΠ ΑΝΑΔ ΕΔΒΜ 2014‐2020</td>
                                    <td className="px-6 py-4 text-center text-patras-buccaneer">{applicantData.not_past_program_points}</td>
                                </tr>
                                <tr className="bg-patras-buccaneer font-semibold">
                                    <td className="px-6 py-4 text-white">Σύνολικά Μόρια</td>
                                    <td className="px-6 py-4 text-center text-white">{applicantData.total_points}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

