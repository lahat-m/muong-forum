// src/pages/UserDashboard.jsx

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api";
import EventComponent from "../components/EventComponent";
import ParticipantsModal from "../components/ParticipantsModal"; // optional: may be used to show who else booked

const UserDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile"); // "profile" or "events"
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalParticipants, setModalParticipants] = useState([]);
    const [modalEventTitle, setModalEventTitle] = useState("");

    // React Hook Form for profile update.
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        reset: resetProfile,
    } = useForm({ defaultValues: { firstName: "", lastName: "", email: "" } });

    const token = localStorage.getItem("ACCESS_TOKEN");

    useEffect(() => {
        if (!token) {
            setTimeout(() => navigate("/auth"), 3000);
        } else {
            fetchUserProfile();
            fetchEvents();
        }
    }, [navigate, token]);

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Please login to access this site.
                </h2>
                <p className="text-gray-600">Redirecting to login page...</p>
            </div>
        );
    }

    // Fetch the user's profile from the backend. This should come from an endpoint like `/user/profile`.
    const fetchUserProfile = async () => {
        try {
            setLoadingProfile(true);
            const res = await api.get("/user/profile");
            setUserProfile(res.data);
            resetProfile({
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                email: res.data.email,
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    // Update user profile.
    const onUpdateProfile = async (data) => {
        try {
            setLoadingProfile(true);
            await api.put("/user/update-profile", data);
            fetchUserProfile(); // re-fetch to update the UI
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    // Delete user profile.
    const onDeleteProfile = async () => {
        try {
            // Confirm deletion.
            if (!window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
                return;
            }
            await api.delete("/user/delete-profile");
            // Clear local storage and navigate to login.
            localStorage.removeItem("ACCESS_TOKEN");
            localStorage.removeItem("REFRESH_TOKEN");
            localStorage.removeItem("USER");
            navigate("/auth");
        } catch (error) {
            console.error("Error deleting profile:", error);
        }
    };

    // Fetch events available for booking.
    const fetchEvents = async () => {
        try {
            setLoadingEvents(true);
            const response = await api.get("/event");
            setEvents(response.data);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoadingEvents(false);
        }
    };

    // Book an event. In production, implement the booking logic on the backend.  
    const onBookEvent = async (eventId) => {
        try {
            setBookingLoading(true);
            await api.post(`/event/book`, { eventId });
            alert("Event booked successfully!");
            // Optionally refresh events list or user bookings.
            fetchEvents();
        } catch (error) {
            console.error("Error booking event:", error);
            alert("Error booking event.");
        } finally {
            setBookingLoading(false);
        }
    };

    // Logout: clear tokens and navigate to the auth page.
    const handleLogout = () => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        localStorage.removeItem("USER");
        navigate("/auth");
    };

    // Optional: view participants (if you have such functionality)
    const handleViewParticipants = async (event) => {
        try {
            if (event.registrations) {
                setModalParticipants(event.registrations.map((reg) => reg.participant));
                setModalEventTitle(event.title);
                setModalVisible(true);
            } else {
                const res = await api.get(`/event/${event.id}/participants`);
                setModalParticipants(res.data);
                setModalEventTitle(event.title);
                setModalVisible(true);
            }
        } catch (error) {
            console.error("Error fetching participants:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navbar */}
            <nav className="bg-white shadow py-4 mb-6">
                <div className="container mx-auto flex justify-between items-center px-4">
                    <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-4">
                {/* Tabs */}
                <div className="flex space-x-6 mb-6">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-4 py-2 rounded ${activeTab === "profile" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("events")}
                        className={`px-4 py-2 rounded ${activeTab === "events" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                            }`}
                    >
                        Events
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="bg-white shadow rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">My Profile</h2>
                        {loadingProfile ? (
                            <p>Loading profile...</p>
                        ) : (
                            <>
                                <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            {...registerProfile("firstName", { required: true })}
                                            className="p-2 border border-gray-300 rounded w-full"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            {...registerProfile("lastName", { required: true })}
                                            className="p-2 border border-gray-300 rounded w-full"
                                        />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        {...registerProfile("email", { required: true })}
                                        className="p-2 border border-gray-300 rounded w-full"
                                    />
                                    <div className="flex space-x-4">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                        >
                                            Update Profile
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onDeleteProfile}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === "events" && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Available Events</h2>
                        {loadingEvents ? (
                            <p>Loading events...</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {events.map((event) => (
                                    <div key={event.id} className="bg-white p-4 rounded shadow-md">
                                        <EventComponent event={event} />
                                        <div className="mt-2">
                                            <button
                                                onClick={() => onBookEvent(event.id)}
                                                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition"
                                                disabled={bookingLoading}
                                            >
                                                {bookingLoading ? "Booking..." : "Book Event"}
                                            </button>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-700">
                                            {event.registrations && event.registrations.length > 0 ? (
                                                <span>{event.registrations.length} Participant{event.registrations.length > 1 ? "s" : ""}</span>
                                            ) : (
                                                <span>0 Participants</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleViewParticipants(event)}
                                            className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400 transition"
                                        >
                                            View Participants
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Optional: Participants Modal */}
            <ParticipantsModal
                visible={modalVisible}
                eventTitle={modalEventTitle}
                participants={modalParticipants}
                onClose={() => setModalVisible(false)}
            />
        </div>
    );
};

export default UserDashboard;
