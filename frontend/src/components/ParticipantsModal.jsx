// frontend/components/ParticipantsModal.jsx
import React from "react";

const ParticipantsModal = ({ visible, eventTitle, participants, onClose }) => {
    if (!visible) return null;

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
                <div className="flex justify-end mt-4">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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