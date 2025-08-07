// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Users, Edit, Trash2, LogOut, Plus, Image, User, MapPin, Clock, Coffee, Video,
  BookOpen, // For Students tab/icon
  GraduationCap, Award, CheckCircle, XCircle // For student details and icons
} from "lucide-react";
import api from "../api";
import ParticipantsModal from "../components/ParticipantsModal";
import Loader from "../components/Loader";
import Notify from "../components/Notify";
import StudentForm from "../components/StudentForm"; // Import the StudentForm component

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
  const [loading, setLoading] = useState(false); // For event/student form submission
  const [loadingEvents, setLoadingEvents] = useState(false); // For fetching events list
  const [loadingStudents, setLoadingStudents] = useState(false); // For fetching students list
  const [editingEvent, setEditingEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalParticipants, setModalParticipants] = useState([]);
  const [modalEventTitle, setModalEventTitle] = useState("");
  const [activeTab, setActiveTab] = useState("events"); // 'events', 'new-event', 'students', 'new-student'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Student specific states
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    const user = JSON.parse(localStorage.getItem("USER") || "{}");

    if (!token || user.role !== 'ADMIN') {
      navigate("/auth", { replace: true });
    } else {
      setIsAuthenticated(true);
      // Fetch initial data based on active tab
      if (activeTab === "events") {
        fetchEvents();
      } else if (activeTab === "students") {
        fetchStudents();
      }
    }
  }, [navigate, activeTab]); // Re-run effect when activeTab changes

  // Fetch events from the backend
  const fetchEvents = useCallback(async () => {
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
  }, []); // No dependencies for useCallback, only runs once on component mount

  // Fetch students from the backend
  const fetchStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      Notify.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  }, []); // No dependencies for useCallback

  // Event form submission handler
  const onSubmitEvent = async (data) => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();

      if (data.eventPoster && data.eventPoster.length > 0) {
        formDataToSend.append("eventPoster", data.eventPoster[0]);
      } else if (editingEvent && editingEvent.eventPoster) {
        // If no new file is selected, but there was an existing one, keep it
        // The backend handles if the `eventPoster` field is absent or null for updates
      }

      const formattedDate = new Date(`${data.date}T${data.time}:00.000Z`).toISOString();
      formDataToSend.append("date", formattedDate);

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
      console.error("Error submitting event form:", error);
      Notify.error(error.response?.data?.message || "Error submitting event");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
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

  const handleDeleteEvent = async (id) => {
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

  // Student specific handlers
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setActiveTab("new-student");
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student profile?")) {
      return;
    }
    try {
      await api.delete(`/students/${id}`);
      Notify.success("Student profile deleted successfully!");
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error("Error deleting student:", error);
      Notify.error(error.response?.data?.message || "Failed to delete student profile.");
    }
  };

  const handleStudentFormSuccess = (studentData) => {
    Notify.success(`Student ${editingStudent ? 'updated' : 'created'} successfully!`);
    setEditingStudent(null);
    setActiveTab("students"); // Go back to student list
    fetchStudents(); // Refresh student list
  };

  const handleStudentFormError = (error) => {
    console.error("Student form error:", error);
    Notify.error(error.response?.data?.message || "Error saving student profile.");
  };

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("USER");
    navigate("/auth");
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
            onClick={() => {
              setActiveTab("new-event");
              setEditingEvent(null);
              reset();
              setPreviewUrl(null);
            }}
            className={`flex items-center px-4 py-3 rounded-lg mr-2 transition ${
              activeTab === "new-event"
                ? "bg-green-700 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            <Plus size={18} className="mr-2" />
            {editingEvent ? "Update Event" : "Create Event"}
          </button>

          {/* NEW TAB: Students Management */}
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`flex items-center px-4 py-3 rounded-lg mr-2 transition ${
              activeTab === "students"
                ? "bg-green-700 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            <BookOpen size={18} className="mr-2" />
            Students Management
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("new-student");
              setEditingStudent(null);
            }}
            className={`flex items-center px-4 py-3 rounded-lg transition ${
              activeTab === "new-student"
                ? "bg-green-700 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            <Plus size={18} className="mr-2" />
            {editingStudent ? "Update Student" : "Create Student"}
          </button>
        </div>

        {/* Conditional Content based on activeTab */}

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
              <form onSubmit={handleSubmit(onSubmitEvent)} className="space-y-6">
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
                            } else {
                              setPreviewUrl(null); // Clear preview if no file selected
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
                onClick={() => {
                  setActiveTab("new-event");
                  setEditingEvent(null);
                  reset();
                  setPreviewUrl(null);
                }}
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
                    onClick={() => {
                      setActiveTab("new-event");
                      setEditingEvent(null);
                      reset();
                      setPreviewUrl(null);
                    }}
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
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                        <div className="flex items-center text-gray-500 text-sm mb-1">
                          <Calendar size={14} className="mr-2" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm mb-1">
                          <Clock size={14} className="mr-2" />
                          <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <MapPin size={14} className="mr-2" />
                          <span>{event.location} ({event.locationType})</span>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <button
                            onClick={() => handleViewParticipants(event)}
                            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          >
                            <Users size={16} className="mr-1" /> Participants
                          </button>
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-green-600 hover:text-green-800 flex items-center text-sm"
                          >
                            <Edit size={16} className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-800 flex items-center text-sm"
                          >
                            <Trash2 size={16} className="mr-1" /> Delete
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

        {/* Student Creation/Editing Form */}
        {activeTab === "new-student" && (
          <StudentForm
            student={editingStudent}
            onSuccess={handleStudentFormSuccess}
            onError={handleStudentFormError}
          />
        )}

        {/* Students List */}
        {activeTab === "students" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-green-700 px-6 py-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <BookOpen size={20} className="mr-2" />
                All Students
              </h2>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("new-student");
                  setEditingStudent(null);
                }}
                className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition flex items-center"
              >
                <Plus size={18} className="mr-1" />
                Add Student
              </button>
            </div>

            <div className="p-6">
              {loadingStudents ? (
                <div className="flex justify-center p-12">
                  <Loader />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Profiles Found</h3>
                  <p className="text-gray-500 mb-6">
                    Start by creating the first student profile!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("new-student");
                      setEditingStudent(null);
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center mx-auto"
                  >
                    <Plus size={18} className="mr-2" />
                    Create First Student Profile
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition flex flex-col"
                    >
                      <div className="p-4 flex items-center">
                        <img
                          src={student.profilePhoto || "https://placehold.co/100x100/A855F7/FFFFFF?text=Student"}
                          alt={`${student.name}'s profile`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-400 mr-4"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/100x100/A855F7/FFFFFF?text=Student";
                            e.currentTarget.onerror = null;
                          }}
                        />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{student.name}</h3>
                          <p className="text-gray-600 text-sm flex items-center">
                            <BookOpen size={14} className="mr-1" /> {student.course}
                          </p>
                          <p className="text-gray-600 text-sm flex items-center">
                            <GraduationCap size={14} className="mr-1" /> Faculty: {student.faculty}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 pt-0 border-t border-gray-100 flex-grow">
                        <p className="text-gray-600 text-sm flex items-center mb-2">
                          {student.graduated ? (
                            <CheckCircle size={14} className="mr-1 text-lime-600" />
                          ) : (
                            <XCircle size={14} className="mr-1 text-red-600" />
                          )}
                          Graduated: {student.graduated ? "Yes" : "No"}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center mb-2">
                            <Calendar size={14} className="mr-1" /> Enrollment: {student.enrollmentYear}
                        </p>
                        {student.skills && student.skills.length > 0 && (
                          <div className="mt-2">
                            <h4 className="font-semibold text-gray-700 text-sm flex items-center mb-1">
                              <Award size={14} className="mr-1" /> Skills:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {student.skills.map((skill, skillIndex) => (
                                <span
                                  key={skill.id || skillIndex}
                                  className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600"
                                >
                                  {skill.name} ({skill.yearsOfExperience} yrs)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                         {!student.skills || student.skills.length === 0 && (
                            <p className="text-gray-600 text-sm mt-2 flex items-center">
                                <Award size={14} className="mr-1 text-gray-400" />
                                No skills listed
                            </p>
                        )}
                      </div>
                      <div className="p-4 border-t border-gray-100 flex justify-end space-x-2 mt-auto">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-green-600 hover:text-green-800 flex items-center text-sm"
                        >
                          <Edit size={16} className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-800 flex items-center text-sm"
                        >
                          <Trash2 size={16} className="mr-1" /> Delete
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
      <ParticipantsModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        participants={modalParticipants}
        eventTitle={modalEventTitle}
      />
    </div>
  );
};

export default Dashboard;