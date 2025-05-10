import React, { useState } from "react";
import { Download, X, Search, Users, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import Loader from "./Loader";

const ParticipantsModal = ({ visible, eventTitle, participants, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    
    if (!visible) return null;
    
    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };
    
    // Filter participants based on search term
    const filteredParticipants = participants.filter(participant => {
        const searchLower = searchTerm.toLowerCase();
        return (
            participant.name.toLowerCase().includes(searchLower) ||
            participant.email.toLowerCase().includes(searchLower) ||
            participant.phone.includes(searchTerm)
        );
    });
    
    // Sort participants
    const sortedParticipants = [...filteredParticipants].sort((a, b) => {
        let compareA = a[sortField]?.toLowerCase?.() || a[sortField];
        let compareB = b[sortField]?.toLowerCase?.() || b[sortField];
        
        if (sortDirection === "asc") {
            return compareA > compareB ? 1 : -1;
        } else {
            return compareA < compareB ? 1 : -1;
        }
    });
    
    // Generate sorted number
    const getSortedNumber = (index) => {
        return index + 1;
    };
    
    // Sort indicator component
    const SortIndicator = ({ field }) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />;
    };

    const handleDownloadPDF = async () => {
        try {
            setLoading(true);
            
            const [{ default: jsPDF }, autoTable] = await Promise.all([
                import("jspdf"),
                import("jspdf-autotable"),
            ]);

            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(16);
            doc.setTextColor(0, 128, 0); // Green color for title
            doc.text(`Participants for: ${eventTitle}`, 14, 20);
            
            // Add event information
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100); // Gray color for metadata
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);
            doc.text(`Total Participants: ${participants.length}`, 14, 30);
            
            // Add Muong Forum branding
            doc.setFontSize(12);
            doc.setTextColor(0, 100, 0); // Dark green
            doc.text("Muong Forum", 170, 20, { align: "right" });

            // Table content
            const tableColumn = ["No.", "Name", "Email", "Phone", "Gender"];
            const tableRows = sortedParticipants.map((participant, index) => [
                getSortedNumber(index),
                participant.name,
                participant.email,
                participant.phone,
                participant.sex === "M" ? "Male" : participant.sex === "F" ? "Female" : participant.sex,
            ]);

            // Create the table
            autoTable.default(doc, {
                startY: 35,
                head: [tableColumn],
                body: tableRows,
                theme: "grid",
                headStyles: {
                    fillColor: [0, 128, 0], // Green header
                    textColor: 255,
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [240, 250, 240], // Light green for alternate rows
                },
                margin: { top: 35 },
            });
            
            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(
                    'Muong Forum - All Rights Reserved',
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            doc.save(`participants_${eventTitle.replace(/\s+/g, "_")}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-xl font-semibold flex items-center">
                        <Users className="mr-2 text-green-600" />
                        Participants for {eventTitle}
                    </h3>
                    <button
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                        onClick={onClose}
                        aria-label="Close Modal"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex items-center justify-between my-3">
                    <div className="relative flex-1 max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Search participants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        {filteredParticipants.length} of {participants.length} participants
                    </div>
                </div>
                
                <div className="overflow-y-auto flex-1 mt-2">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    No.
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center">
                                        Name <SortIndicator field="name" />
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("email")}
                                >
                                    <div className="flex items-center">
                                        Email <SortIndicator field="email" />
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("phone")}
                                >
                                    <div className="flex items-center">
                                        Phone <SortIndicator field="phone" />
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("sex")}
                                >
                                    <div className="flex items-center">
                                        Gender <SortIndicator field="sex" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedParticipants.length > 0 ? (
                                sortedParticipants.map((participant, index) => (
                                    <tr key={participant.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {getSortedNumber(index)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                                {participant.email}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                                {participant.phone}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                participant.sex === 'M' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : participant.sex === 'F'
                                                        ? 'bg-pink-100 text-pink-800'
                                                        : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {participant.sex === 'M' 
                                                    ? 'Male' 
                                                    : participant.sex === 'F' 
                                                        ? 'Female' 
                                                        : participant.sex}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        {participants.length === 0 
                                            ? "No participants registered yet." 
                                            : "No results match your search."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="flex justify-end mt-4 space-x-3 pt-3 border-t">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        onClick={handleDownloadPDF}
                        disabled={participants.length === 0 || loading}
                    >
                        {loading ? (
                            <>
                                <Loader size="sm" className="mr-2" /> 
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download size={16} className="mr-2" />
                                Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParticipantsModal;