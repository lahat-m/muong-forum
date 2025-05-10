// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { UserCheck, Calendar, LogOut, User, Mail, Edit2 } from "lucide-react";
import api from "../api";
import EventComponent from "../components/EventComponent";
import BookSpot from "../components/BookSpot";
import Loader from "../components/Loader";
import Notify from "../components/Notify";

const UserDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [showBookSpot, setShowBookSpot] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRegistrations, setUserRegistrations] = useState([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);

    // React Hook Form for profile update
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        reset: resetProfile,
        formState: { errors }
    } = useForm();

    // Check authentication on component mount
    useEffect(() => {
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) {
            navigate("/auth", { replace: true });
        } else {
            setIsAuthenticated(true);
            fetchUserProfileData();
            fetchEvents();
            fetchUserRegistrations();
        }
    }, [navigate]);

    // Fetch the user's profile
    const fetchUserProfileData = async () => {
        try {
            setLoadingProfile(true);
            const res = await api.get("/profile");
            setUserProfile(res.data);
            
            // Reset form with current user data
            resetProfile({
                firstName: res.data.firstName || "",
                lastName: res.data.lastName || "",
                email: res.data.email || "",
                username: res.data.username || "",
            });
            
            console.log("Profile data fetched:", res.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
            if (error.response && error.response.status === 401) {
                handleLogout();
            }
        } finally {
            setLoadingProfile(false);
        }
    };

    // Fetch user event registrations
    const fetchUserRegistrations = async () => {
        try {
            setLoadingRegistrations(true);
            // This endpoint might need to be implemented on your backend
            // It should return events the user has registered for
            const response = await api.get("/event/user-registrations");
            setUserRegistrations(response.data);
        } catch (error) {
            console.error("Error fetching registrations:", error);
        } finally {
            setLoadingRegistrations(false);
        }
    };

    // Update user profile
    const onUpdateProfile = async (data) => {
        try {
            console.log("Updating profile with data:", data);
            setUpdatingProfile(true);
            
            // Ensure we're only sending fields that can be updated
            const updateData = {
                firstName: data.firstName,
                lastName: data.lastName
            };
            
            const response = await api.patch("/user/update-profile", updateData);
            console.log("Profile update response:", response.data);
            
            // Update localStorage with new user info
            const userInfo = JSON.parse(localStorage.getItem("USER") || "{}");
            const updatedUserInfo = {
                ...userInfo,
                firstName: data.firstName,
                lastName: data.lastName
            };
            localStorage.setItem("USER", JSON.stringify(updatedUserInfo));
            
            Notify.success("Profile updated successfully!");
            
            // Refresh user profile data
            fetchUserProfileData();
        } catch (error) {
            console.error("Error updating profile:", error);
            Notify.error(error.response?.data?.message || "Failed to update profile. Please try again.");
        } finally {
            setUpdatingProfile(false);
        }
    };

    // Delete user profile
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
            Notify.success("Account deleted successfully");
            handleLogout();
        } catch (error) {
            console.error("Error deleting profile:", error);
            Notify.error("Failed to delete account. Please try again.");
        }
    };

    // Fetch events
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

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        localStorage.removeItem("USER");
        navigate("/auth");
    };

    // Open BookSpot modal
    const handleOpenBookSpot = (event) => {
        setSelectedEvent(event);
        setShowBookSpot(true);
    };

    // If not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-blue-600 text-white">
                <h2 className="text-4xl font-bold mb-4">
                    You must be logged in to access this page
                </h2>
                <p className="text-lg mb-6">Redirecting to login page...</p>
                <Loader />
            </div>
        );
    }

    // Get user info from localStorage for header display
    const userInfo = JSON.parse(localStorage.getItem("USER") || "{}");
    const userName = userInfo.firstName || userInfo.username || "User";

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Background Image */}
            <img
                className="fixed top-0 left-0 w-full h-full object-cover z-[-2] opacity-20"
                src="/bg.gif"
                alt="Background Animation"
            />

            {/* Dashboard Header */}
            <header className="bg-green-800 text-white shadow-lg">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <h1 className="text-3xl font-bold mr-2">Muong Forum</h1>
                            <span className="bg-green-700 px-3 py-1 rounded-full text-sm">
                                Dashboard
                            </span>
                        </div>
                        
                        <div className="flex items-center">
                            <div className="mr-6 text-right hidden md:block">
                                <p className="font-medium">Welcome, {userName}</p>
                                <p className="text-sm text-green-200">{userInfo.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                                type="button"
                            >
                                <LogOut size={18} className="mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Dashboard Content */}
            <main className="container mx-auto px-6 py-8">
                {/* Dashboard Navigation Tabs */}
                <div className="flex flex-wrap mb-8 bg-white shadow rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex items-center px-4 py-3 rounded-lg mr-2 transition ${
                            activeTab === "profile" 
                                ? "bg-green-600 text-white" 
                                : "hover:bg-gray-100"
                        }`}
                        type="button"
                    >
                        <User size={18} className="mr-2" />
                        My Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("events")}
                        className={`flex items-center px-4 py-3 rounded-lg mr-2 transition ${
                            activeTab === "events" 
                                ? "bg-green-600 text-white" 
                                : "hover:bg-gray-100"
                        }`}
                        type="button"
                    >
                        <Calendar size={18} className="mr-2" />
                        Available Events
                    </button>
                    <button
                        onClick={() => setActiveTab("registrations")}
                        className={`flex items-center px-4 py-3 rounded-lg transition ${
                            activeTab === "registrations" 
                                ? "bg-green-600 text-white" 
                                : "hover:bg-gray-100"
                        }`}
                        type="button"
                    >
                        <UserCheck size={18} className="mr-2" />
                        My Registrations
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="bg-green-700 px-6 py-4 text-white">
                            <h2 className="text-xl font-semibold flex items-center">
                                <User size={20} className="mr-2" />
                                My Profile
                            </h2>
                        </div>
                        
                        {loadingProfile ? (
                            <div className="p-6 flex justify-center">
                                <Loader />
                            </div>
                        ) : (
                            <div className="p-6">
                                <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                {...registerProfile("firstName", { required: "First name is required" })}
                                                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                            />
                                            {errors.firstName && (
                                                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                {...registerProfile("lastName", { required: "Last name is required" })}
                                                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                            />
                                            {errors.lastName && (
                                                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="flex">
                                            <div className="relative w-full">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Mail size={18} className="text-gray-500" />
                                                </div>
                                                <input
                                                    type="email"
                                                    {...registerProfile("email")}
                                                    className="p-3 pl-10 border border-gray-300 rounded-lg w-full bg-gray-50"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            {...registerProfile("username")}
                                            className="p-3 border border-gray-300 rounded-lg w-full bg-gray-50"
                                            readOnly
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            type="submit"
                                            disabled={updatingProfile}
                                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition flex items-center justify-center"
                                        >
                                            {updatingProfile ? (
                                                <>
                                                    <Loader size="sm" className="mr-2" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Edit2 size={18} className="mr-2" />
                                                    Update Profile
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onDeleteProfile}
                                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === "events" && (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="bg-green-700 px-6 py-4 text-white">
                            <h2 className="text-xl font-semibold flex items-center">
                                <Calendar size={20} className="mr-2" />
                                Available Events
                            </h2>
                        </div>
                        
                        <div className="p-6">
                            {loadingEvents ? (
                                <div className="flex justify-center p-12">
                                    <Loader />
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Available</h3>
                                    <p className="text-gray-500">
                                        There are no events scheduled at the moment. Please check back later.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {events.map((event) => (
                                        <div key={event.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                                            {event.eventPoster && (
                                                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                                                    <img 
                                                        src={event.eventPoster} 
                                                        alt={event.title} 
                                                        className="object-cover w-full h-48"
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className="p-4">
                                                <EventComponent event={event} />
                                                
                                                <div className="mt-6 flex items-center justify-between">
                                                    <div className="flex items-center text-green-700">
                                                        <UserCheck className="h-5 w-5 mr-1" />
                                                        <span className="text-sm font-medium">
                                                            {event.registrations?.length || 0} Attending
                                                        </span>
                                                    </div>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenBookSpot(event)}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                                    >
                                                        Register Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Registrations Tab */}
                {activeTab === "registrations" && (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="bg-green-700 px-6 py-4 text-white">
                            <h2 className="text-xl font-semibold flex items-center">
                                <UserCheck size={20} className="mr-2" />
                                My Registrations
                            </h2>
                        </div>
                        
                        <div className="p-6">
                            {loadingRegistrations ? (
                                <div className="flex justify-center p-12">
                                    <Loader />
                                </div>
                            ) : userRegistrations.length === 0 ? (
                                <div className="text-center py-12">
                                    <UserCheck className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Registrations Yet</h3>
                                    <p className="text-gray-500 mb-6">
                                        You haven't registered for any events yet.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("events")}
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                    >
                                        Browse Available Events
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {userRegistrations.map((registration) => (
                                        <div key={registration.id} className="py-6 flex flex-col md:flex-row">
                                            <div className="md:w-1/4 mb-4 md:mb-0">
                                                {registration.event.eventPoster ? (
                                                    <img 
                                                        src={registration.event.eventPoster} 
                                                        alt={registration.event.title}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded-lg">
                                                        <Calendar className="h-10 w-10 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="md:w-3/4 md:pl-6">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {registration.event.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {new Date(registration.event.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-700 mb-4">
                                                    {registration.event.location} • {registration.event.locationType}
                                                </p>
                                                
                                                <div className="flex items-center text-sm text-green-700">
                                                    <UserCheck className="h-4 w-4 mr-1" />
                                                    <span>
                                                        Registered on {new Date(registration.registrationDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-green-800 text-white mt-12 py-6">
                <div className="container mx-auto px-6 text-center">
                    <p>
                        Contact us:{" "}
                        <a href="mailto:info@muongforum.com" className="underline hover:text-green-300">
                            info@muongforum.com
                        </a>{" "}
                        | Phone:{" "}
                        <a href="tel:+254743000000" className="underline hover:text-green-300">
                            +254 743 000 000
                        </a>
                    </p>
                    <p className="mt-2">&copy; {new Date().getFullYear()} Muong Forum. All Rights Reserved.</p>
                </div>
            </footer>

            {/* Book Spot Modal */}
            <BookSpot
                visible={showBookSpot}
                event={selectedEvent}
                onCancel={() => setShowBookSpot(false)}
                onSuccess={() => {
                    setShowBookSpot(false);
                    fetchEvents();
                    fetchUserRegistrations(); // Refresh user registrations after booking
                }}
            />
        </div>
    );
};

export default UserDashboard;