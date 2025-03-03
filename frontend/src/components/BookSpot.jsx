import React from "react";

const BookSpot = ({ visible, event, onCancel }) => {
    if (!visible || !event) return null;
    return (
        <div className="fixed inset-0 z-20 flex items-center justify-center backdrop-blur-md">
            <div className="bg-white p-8 rounded-lg text-black shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Book a spot in {event.title}</h2>
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-400 transition"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-400 transition">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookSpot;
