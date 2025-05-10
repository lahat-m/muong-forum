// frontend/components/BookSpot.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api";
import Notify from "../components/Notify";
import Loader from "../components/Loader";

const BookSpot = ({ visible, event, onCancel, onSuccess }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [submitting, setSubmitting] = useState(false);

    // Only render if visible and an event is provided.
    if (!visible || !event) return null;

    const checkTokenAndProceed = async (apiCall) => {
        try {
            return await apiCall();
        } catch (error) {
            console.error("API call error:", error);
            
            if (error.response && error.response.status === 401) {
                // Try to get a fresh token using the refresh token
                try {
                    const refreshToken = localStorage.getItem("REFRESH_TOKEN");
                    if (!refreshToken) {
                        throw new Error("No refresh token available");
                    }
                    
                    const refreshResponse = await api.post("/auth/refresh-token", {
                        refreshToken: refreshToken
                    });
                    
                    if (refreshResponse.data && refreshResponse.data.accessToken) {
                        localStorage.setItem("ACCESS_TOKEN", refreshResponse.data.accessToken);
                        
                        // Retry the original API call with the new token
                        return await apiCall();
                    } else {
                        throw new Error("Invalid refresh response");
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    Notify.error("Your session has expired. Please log in again.");
                    throw refreshError;
                }
            }
            
            throw error;
        }
    };

    const onSubmit = async (data) => {
        console.log("Submitting participant data:", data);
        setSubmitting(true);
        try {
            // Get user info from localStorage
            const userInfo = JSON.parse(localStorage.getItem("USER") || "{}");
            
            // Prepare payload with participant details and event ID.
            // Using the exact structure that your API expects
            const payload = { 
                eventId: event.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                sex: data.sex,
                // Optional: Add userId if you want to track which user registered
                userId: userInfo.id
            };

            console.log("Sending payload to register-participant:", payload);

            // Post participant data to API using the exact endpoint from your backend
            const response = await checkTokenAndProceed(() => 
                api.post("/participant/register-participant", payload)
            );

            console.log("Registration response:", response.data);

            // Show success notification
            Notify.success("You have successfully registered for this event!");

            // Reset the form and notify the parent component
            reset();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error registering participant:", error);
            
            // Show appropriate error message
            if (error.response && error.response.data && error.response.data.message) {
                Notify.error(error.response.data.message);
            } else {
                Notify.error("Failed to register. Please try again later.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-20 flex items-center justify-center backdrop-blur-md bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg text-black shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-2">
                    Book a Spot
                </h2>
                <h3 className="text-lg text-gray-700 mb-4">{event.title}</h3>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            {...register("name", { 
                                required: "Name is required" 
                            })}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            {...register("email", { 
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            {...register("phone", { 
                                required: "Phone number is required",
                                pattern: {
                                    value: /^[0-9+\s-]{10,15}$/,
                                    message: "Please enter a valid phone number"
                                }
                            })}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-1">Gender</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            {...register("sex", { 
                                required: "Please select your gender" 
                            })}
                        >
                            <option value="">Select...</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </select>
                        {errors.sex && (
                            <p className="text-red-500 text-sm mt-1">{errors.sex.message}</p>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`bg-green-600 text-white px-6 py-2 rounded-md transition flex items-center justify-center ${
                                submitting ? "opacity-70 cursor-not-allowed" : "hover:bg-green-700"
                            }`}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader size="sm" className="mr-2" />
                                    Registering...
                                </>
                            ) : (
                                "Register Now"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookSpot;