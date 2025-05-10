// src/pages/Dashboard.jsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Edit, Trash2, LogOut, Plus, Image, User, MapPin, Clock, Coffee, Video } from "lucide-react";
import api from "../api";
import ParticipantsModal from "../components/ParticipantsModal";
import Loader from "../components/Loader";
import Notify from "../components/Notify";

const today = new Date().toISOString().split("T")[0];

const Dashboard = () => {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: {
            title: "",
            eventFocus: "",
            description: "",
            date: "",
            time: "",
            location: "",
            locationType: "ONSITE",
            guestName: "",
            guestDesc: "",
            eventPoster: null,
        },
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalParticipants, setModalParticipants] = useState([]);
    const [modalEventTitle, setModalEventTitle] = useState("");
    const [activeTab, setActiveTab] = useState("events");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem("ACCESS_TOKEN");
        const user = JSON.parse(localStorage.getItem("USER") || "{}");
        
        if (!token || user.role !== 'ADMIN') {
            navigate("/auth", { replace: true });
        } else {
            setIsAuthenticated(true);
            fetchEvents();
        }
    }, [navigate]);

    // Fetch events from the backend
    const fetchEvents = async () => {
        try {
            setLoadingEvents(true);
            const response = await api.get("/event");
            setEvents(response.data);
        } catch (error) {
            console.error("Error fetching events:", error);
            Notify.error("Failed to load events");
        } finally {
            setLoadingEvents(false);
        }
    };

    // Submit new or update event
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formDataToSend = new FormData();

            // Append the event poster file
            if (data.eventPoster && data.eventPoster.length > 0) {
                formDataToSend.append("eventPoster", data.eventPoster[0]);
            }

            // Format the date/time for ISO string
            const formattedDate = new Date(`${data.date}T${data.time}:00.000Z`).toISOString();
            formDataToSend.append("date", formattedDate);

            // Append other fields
            ["title", "eventFocus", "description", "location", "locationType", "guestName", "guestDesc"].forEach((key) => {
                formDataToSend.append(key, data[key]);
            });

            if (editingEvent && editingEvent.id) {
                await api.patch(`/event/${editingEvent.id}`, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                Notify.success("Event updated successfully!");
            } else {
                await api.post("/event", formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                Notify.success("Event created successfully!");
            }
            
            reset();
            setPreviewUrl(null);
            setEditingEvent(null);
            fetchEvents();
            setActiveTab("events");
        } catch (error) {
            console.error("Error submitting form:", error);
            Notify.error(error.response?.data?.message || "Error submitting event");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (event) => {
        const isoDate = new Date(event.date);
        const formattedDate = isoDate.toISOString().slice(0, 10);
        const formattedTime = isoDate.toISOString().slice(11, 16);
        setEditingEvent(event);
        reset({
            ...event,
            date: formattedDate,
            time: formattedTime,
        });
        setPreviewUrl(event.eventPoster);
        setActiveTab("new-event");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) {
            return;
        }
        
        try {
            await api.delete(`/event/${id}`);
            Notify.success("Event deleted successfully");
            fetchEvents();
        } catch (error) {
            console.error("Error deleting event:", error);
            Notify.error("Failed to delete event");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        localStorage.removeItem("USER");
        navigate("/auth");
    };

    const handleViewParticipants = async (event) => {
        try {
            if (event.registrations) {
                setModalParticipants(event.registrations.map((reg) => reg.participant));
            } else {
                const res = await api.get(`/event/${event.id}/participants`);
                setModalParticipants(res.data);
            }
            setModalEventTitle(event.title);
            setModalVisible(true);
        } catch (error) {
            console.error("Error fetching participants:", error);
            Notify.error("Failed to load participants");
        }
    };

    // Handle switching to new event form
    const handleSwitchToNewEvent = (e) => {
        // Prevent default form submission
        if (e) e.preventDefault();
        
        setActiveTab("new-event");
        setEditingEvent(null);
        reset();
        setPreviewUrl(null);
    };

    // If not authenticated yet
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-blue-600 text-white">
                <h2 className="text-4xl font-bold mb-4">
                    Administrator Access Required
                </h2>
                <p className="text-lg mb-6">Redirecting to login page...</p>
                <Loader />
            </div>
        );
    }

    // Get admin info for header
    const adminInfo = JSON.parse(localStorage.getItem("USER") || "{}");
    const adminName = adminInfo.firstName || adminInfo.username || "Admin";

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Background Image */}
            <img
                className="fixed top-0 left-0 w-full h-full object-cover z-[-2] opacity-20"
                src="/bg.gif"
                alt="Background Animation"
            />

            {/* Dashboard Header */}
            <header className="bg-green-900 text-white shadow-lg">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <h1 className="text-3xl font-bold mr-2">Muong Forum</h1>
                            <span className="bg-green-800 px-3 py-1 rounded-full text-sm">
                                Admin Dashboard
                            </span>
                        </div>
                        
                        <div className="flex items-center">
                            <div className="mr-6 text-right hidden md:block">
                                <p className="font-medium">Welcome, {adminName}</p>
                                <p className="text-sm text-green-200">Administrator</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
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
                        type="button" 
                        onClick={() => setActiveTab("events")}
                        className={`flex items-center px-4 py-3 rounded-lg mr-2 transition ${
                            activeTab === "events" 
                                ? "bg-green-700 text-white" 
                                : "hover:bg-gray-100"
                        }`}
                    >
                        <Calendar size={18} className="mr-2" />
                        All Events
                    </button>
                    <button
                        type="button"
                        onClick={handleSwitchToNewEvent}
                        className={`flex items-center px-4 py-3 rounded-lg transition ${
                            activeTab === "new-event" 
                                ? "bg-green-700 text-white" 
                                : "hover:bg-gray-100"
                        }`}
                    >
                        <Plus size={18} className="mr-2" />
                        {editingEvent ? "Update Event" : "Create Event"}
                    </button>
                </div>

                {/* Event Creation/Editing Form */}
                {activeTab === "new-event" && (
                    <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                        <div className="bg-green-700 px-6 py-4 text-white">
                            <h2 className="text-xl font-semibold flex items-center">
                                {editingEvent ? (
                                    <>
                                        <Edit size={20} className="mr-2" />
                                        Update Event: {editingEvent.title}
                                    </>
                                ) : (
                                    <>
                                        <Plus size={20} className="mr-2" />
                                        Create New Event
                                    </>
                                )}
                            </h2>
                        </div>
                        
                        <div className="p-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Event Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Event Title*
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Event Title"
                                            {...register("title", { 
                                                required: "Title is required" 
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg"
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Event Focus/Category*
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Event Focus (e.g., Education, Culture)"
                                            {...register("eventFocus", { 
                                                required: "Event focus is required" 
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg"
                                        />
                                        {errors.eventFocus && (
                                            <p className="mt-1 text-sm text-red-600">{errors.eventFocus.message}</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Event Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Event Description*
                                    </label>
                                    <textarea
                                        placeholder="Detailed description of the event"
                                        {...register("description", { 
                                            required: "Description is required",
                                            minLength: {
                                                value: 20,
                                                message: "Description should be at least 20 characters"
                                            }
                                        })}
                                        className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                                    )}
                                </div>
                                
                                {/* Date and Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <Calendar size={16} className="mr-1" />
                                            Event Date*
                                        </label>
                                        <input
                                            type="date"
                                            min={today}
                                            {...register("date", {
                                                required: "Date is required",
                                                validate: val =>
                                                    new Date(val) >= new Date(today) || "Date cannot be in the past",
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg"
                                        />
                                        {errors.date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <Clock size={16} className="mr-1" />
                                            Event Time*
                                        </label>
                                        <input
                                            type="time"
                                            {...register("time", { 
                                                required: "Time is required" 
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg"
                                        />
                                        {errors.time && (
                                            <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <MapPin size={16} className="mr-1" />
                                            Event Location*
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Physical location or online platform"
                                            {...register("location", { 
                                                required: "Location is required" 
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg"
                                        />
                                        {errors.location && (
                                            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            Location Type*
                                        </label>
                                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                            <label className={`flex-1 flex items-center justify-center p-3 cursor-pointer ${
                                                watch("locationType") === "ONSITE" ? "bg-green-100 text-green-700" : "bg-white"
                                            }`}>
                                                <Coffee size={16} className="mr-1" />
                                                <span>ONSITE</span>
                                                <input
                                                    type="radio"
                                                    value="ONSITE"
                                                    {...register("locationType")}
                                                    className="hidden"
                                                />
                                            </label>
                                            <label className={`flex-1 flex items-center justify-center p-3 cursor-pointer ${
                                                watch("locationType") === "ONLINE" ? "bg-green-100 text-green-700" : "bg-white"
                                            }`}>
                                                <Video size={16} className="mr-1" />
                                                <span>ONLINE</span>
                                                <input
                                                    type="radio"
                                                    value="ONLINE"
                                                    {...register("locationType")}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Guest Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <User size={16} className="mr-1" />
                                            Guest Speaker Name*
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Name of guest speaker"
                                            {...register("guestName", { 
                                                required: "Guest name is required" 
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg"
                                        />
                                        {errors.guestName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.guestName.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Guest Speaker Description*
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Brief bio of guest speaker"
                                            {...register("guestDesc", { 
                                                required: "Guest description is required" 
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg"
                                        />
                                        {errors.guestDesc && (
                                            <p className="mt-1 text-sm text-red-600">{errors.guestDesc.message}</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Event Poster */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                        <Image size={16} className="mr-1" />
                                        Event Poster {editingEvent ? "(Optional)" : "* (Required)"}
                                    </label>
                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                {...register("eventPoster", {
                                                    required: !editingEvent ? "Event poster is required" : false,
                                                    onChange: (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setPreviewUrl(URL.createObjectURL(file));
                                                        }
                                                    },
                                                })}
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                            />
                                            {errors.eventPoster && (
                                                <p className="mt-1 text-sm text-red-600">{errors.eventPoster.message}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">
                                                Recommended size: 1200 x 630 pixels
                                            </p>
                                        </div>
                                        
                                        {previewUrl && (
                                            <div className="w-40 h-40 border rounded-lg overflow-hidden shadow-md bg-gray-50 flex items-center justify-center">
                                                <img
                                                    src={previewUrl}
                                                    alt="Event poster preview"
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Submit Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader size="sm" className="mr-2" />
                                                {editingEvent ? "Updating..." : "Creating..."}
                                            </>
                                        ) : (
                                            <>
                                                {editingEvent ? <Edit size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
                                                {editingEvent ? "Update Event" : "Create Event"}
                                            </>
                                        )}
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={() => {
                                            reset();
                                            setPreviewUrl(null);
                                            setEditingEvent(null);
                                            setActiveTab("events");
                                        }}
                                        className="py-3 px-6 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Events List */}
                {activeTab === "events" && (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="bg-green-700 px-6 py-4 text-white flex justify-between items-center">
                            <h2 className="text-xl font-semibold flex items-center">
                                <Calendar size={20} className="mr-2" />
                                All Events
                            </h2>
                            <button
                                type="button"
                                onClick={handleSwitchToNewEvent}
                                className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition flex items-center"
                            >
                                <Plus size={18} className="mr-1" />
                                Add Event
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {loadingEvents ? (
                                <div className="flex justify-center p-12">
                                    <Loader />
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Created Yet</h3>
                                    <p className="text-gray-500 mb-6">
                                        Get started by creating your first event!
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleSwitchToNewEvent}
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center mx-auto"
                                    >
                                        <Plus size={18} className="mr-2" />
                                        Create First Event
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {events.map((event) => (
                                        <div 
                                            key={event.id} 
                                            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
                                        >
                                            {event.eventPoster && (
                                                <div className="h-48 bg-gray-200 relative">
                                                    <img 
                                                        src={event.eventPoster} 
                                                        alt={event.title} 
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className="p-4">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {new Date(event.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                                                    {event.description}
                                                </p>
                                                
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div className="flex items-center text-green-700">
                                                        <Users size={16} className="mr-1" />
                                                        <span className="text-sm font-medium">
                                                            {event.registrations?.length || 0} {event.registrations?.length === 1 ? 'Attendee' : 'Attendees'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                        {event.locationType}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(event)}
                                                        className="flex items-center justify-center py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                                                    >
                                                        <Edit size={16} className="mr-1" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(event.id)}
                                                        className="flex items-center justify-center py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                    >
                                                        <Trash2 size={16} className="mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewParticipants(event)}
                                                    className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                                                >
                                                    <Users size={16} className="mr-1" />
                                                    View Participants
                                                </button>
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
            <footer className="bg-green-900 text-white mt-12 py-6">
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

            {/* Participants Modal */}
            <ParticipantsModal
                visible={modalVisible}
                eventTitle={modalEventTitle}
                participants={modalParticipants}
                onClose={() => setModalVisible(false)}
            />
        </div>
    );
};

export default Dashboard;