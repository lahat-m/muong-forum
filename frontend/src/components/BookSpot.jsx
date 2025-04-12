// frontend/components/BookSpot.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api";

const BookSpot = ({ visible, event, onCancel, onSuccess }) => {
    const { register, handleSubmit, reset } = useForm();
    const [submitting, setSubmitting] = useState(false);

    // Only render if visible and an event is provided.
    if (!visible || !event) return null;

    const onSubmit = async (data) => {
        console.log("Submitting participant data:", data);
        setSubmitting(true);
        try {
            // Prepare payload with participant details and event ID.
            const payload = { ...data, eventId: event.id };

            // Post participant data to your API.
            // Update the endpoint if necessary. For example, if your backend expects
            // `/participant/register-participant`, then use that.
            await api.post("/participant/register-participant", payload);

            // Reset the form and notify the parent component.
            reset();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error registering participant", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-20 flex items-center justify-center backdrop-blur-md">
            <div className="bg-white p-8 rounded-lg text-black shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">
                    Book a Spot in {event.title}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            {...register("name", { required: true })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            {...register("email", { required: true })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            {...register("phone", { required: true })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Sex</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            {...register("sex", { required: true })}
                            required
                        >
                            <option value="">Select...</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-400 transition"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`bg-green-500 text-white px-4 py-2 rounded-md transition ${submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-green-400"
                                }`}
                            disabled={submitting}
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookSpot;