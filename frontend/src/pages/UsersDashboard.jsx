// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api";
import EventComponent from "../components/EventComponent";
import BookSpot from "../components/BookSpot";
import Loader from "../components/Loader";

const UserDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile"); // "profile" or "events"
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    // New state for showing the BookSpot modal
    const [showBookSpot, setShowBookSpot] = useState(false);
    // State to hold the currently selected event for booking
    const [selectedEvent, setSelectedEvent] = useState(null);

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
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <h2 className="text-4xl font-bold mb-4">
                    You must be logged in to access this site
                </h2>
                <p className="text-lg">Redirecting to login page...</p>
            </div>
        );
    }

    // Fetch the user's profile from the backend (GET /user/profile)
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

    // Update user profile (PUT /user/update-profile)
    const onUpdateProfile = async (data) => {
        try {
            setLoadingProfile(true);
            await api.put("/user/update-profile", data);
            fetchUserProfile(); // re-fetch to update the UI
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile. Please try again.");
        } finally {
            setLoadingProfile(false);
        }
    };

    // Delete user profile (DELETE /user/delete-profile)
    const onDeleteProfile = async () => {
        if (
            !window.confirm(
                "Are you sure you want to delete your account? This action is irreversible."
            )
        ) {
            return;
        }
        try {
            await api.delete("/user/delete-profile");
            localStorage.removeItem("ACCESS_TOKEN");
            localStorage.removeItem("REFRESH_TOKEN");
            localStorage.removeItem("USER");
            navigate("/auth");
        } catch (error) {
            console.error("Error deleting profile:", error);
            alert("Error deleting profile. Please try again later.");
        }
    };

    // Fetch events available for booking (GET /event)
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

    // Logout: clear tokens and navigate to the auth page.
    const handleLogout = () => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        localStorage.removeItem("USER");
        navigate("/");
    };

    // When a user wants to book an event, open the BookSpot modal
    const handleOpenBookSpot = (event) => {
        setSelectedEvent(event);
        setShowBookSpot(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
            {/* Top Navbar with Glass Effect */}
            <nav className="bg-white/80 backdrop-filter backdrop-blur-md shadow-md py-4 mb-10">
                <div className="container mx-auto flex justify-between items-center px-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        <span className="text-blue-600">Yaude</span> User Dashboard
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-5 py-2 bg-red-500 text-white rounded-full transform hover:scale-105 transition duration-300 shadow"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Tabs for Navigation */}
            <div className="container mx-auto px-6 flex justify-center mb-8">
                <div className="flex space-x-6">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-4 py-2 rounded ${activeTab === "profile"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("events")}
                        className={`px-4 py-2 rounded ${activeTab === "events"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                            }`}
                    >
                        Events
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="bg-white shadow rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">My Profile</h2>
                        {loadingProfile ? (
                            <p>Loading profile...</p>
                        ) : (
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
                        )}
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === "events" && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Available Events</h2>
                        {loadingEvents ? (
                            < Loader />
                        ) : events.length === 0 ? (
                            <p>No events available at the moment. Please check back later!</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {events.map((event) => (
                                    <div key={event.id} className="bg-white p-4 rounded shadow-md">
                                        <EventComponent event={event} />
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleOpenBookSpot(event)}
                                                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition"
                                            >
                                                Book Event
                                            </button>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-700">
                                            {event.registrations && event.registrations.length > 0 ? (
                                                <span>
                                                    {event.registrations.length} Participant
                                                    {event.registrations.length > 1 ? "s" : ""}
                                                </span>
                                            ) : (
                                                <span>0 Participants</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Book Spot Modal */}
            <BookSpot
                visible={showBookSpot}
                event={selectedEvent}
                onCancel={() => setShowBookSpot(false)}
                onSuccess={() => {
                    setShowBookSpot(false);
                    // Refresh events so participant counts update
                    fetchEvents();
                }}
            />
        </div>
    );
};

export default UserDashboard;
