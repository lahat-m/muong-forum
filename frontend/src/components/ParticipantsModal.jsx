import React from "react";

const ParticipantsModal = ({ visible, eventTitle, participants, onClose }) => {
    if (!visible) return null;

    const handleDownloadPDF = async () => {
        const [{ default: jsPDF }, autoTable] = await Promise.all([
            import("jspdf"),
            import("jspdf-autotable"),
        ]);

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Participants for ${eventTitle}`, 14, 20);

        const tableColumn = ["S/N", "Name", "Email", "Phone", "Sex"];
        const tableRows = participants.map((participant) => [
            participant.id,
            participant.name,
            participant.email,
            participant.phone,
            participant.sex,
        ]);

        autoTable.default(doc, {
            startY: 30,
            head: [tableColumn],
            body: tableRows,
            theme: "grid",
        });

        doc.save(`participants_${eventTitle.replace(/\s+/g, "_")}.pdf`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-xl font-semibold">Participants for {eventTitle}</h3>
                    <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={onClose}
                        aria-label="Close Modal"
                    >
                        ×
                    </button>
                </div>
                <div className="mt-4 max-h-60 overflow-y-auto">
                    {participants.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {participants.map((participant) => (
                                <li key={participant.id} className="py-2">
                                    <p className="font-medium">{participant.name}</p>
                                    <p className="text-sm text-gray-600">{participant.email}</p>
                                    <p className="text-sm text-gray-600">
                                        {participant.phone} | {participant.sex}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No participants registered yet.</p>
                    )}
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-gray-600"
                        onClick={handleDownloadPDF}
                        disabled={participants.length === 0}
                    >
                        Download Participants
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParticipantsModal;
