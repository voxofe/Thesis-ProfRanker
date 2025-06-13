import React, { useState } from 'react';

export default function PapersDrawer({ papers }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="border-t border-gray-300">
            {/* Drawer Header */}
            <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer bg-patras-[#fffbf6] hover:bg-patras-albescentWhite"
                onClick={toggleDrawer}
            >
                <span className="text-patras-buccaneer font-medium">Δημοσιεύσεις/Ανακοινώσεις σε συνέδρια</span>
                <span className="text-patras-buccaneer text-lg">
                    {isOpen ? '▼' : '▶'}
                </span>
            </div>

            {/* Drawer Content */}
            {isOpen && (
                <div className="overflow-x-auto px-6 pb-4">
                    <table className="min-w-full bg-[#fffbf6] border border-patras-cameo rounded-lg shadow-md">
                        <thead className="bg-patras-buccaneer">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                    Είδος
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                    Έτος
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                    Τίτλος
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                    ISSN
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                    Χώρα
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                    Quartile
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-patras-cameo">
                            {papers.map((paper, index) => (
                                <tr key={index} className="hover:bg-patras-albescentWhite">
                                    <td className="px-4 py-2 text-patras-buccaneer">{paper.type || 'N/A'}</td>
                                    <td className="px-4 py-2 text-patras-buccaneer">{paper.year || 'N/A'}</td>
                                    <td className="px-4 py-2 text-patras-buccaneer">{paper.paper_title || 'N/A'}</td>
                                    <td className="px-4 py-2 text-patras-buccaneer">{paper.issn || 'N/A'}</td>
                                    <td className="px-4 py-2 text-patras-buccaneer">{paper.country || 'N/A'}</td>
                                    <td className="px-4 py-2 text-patras-buccaneer">{paper.quartile || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}