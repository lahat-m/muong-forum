// src/pages/LandingPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserCheck, Mail, Key, Info } from "lucide-react";
import api from "../api";
import Loader from "../components/Loader";
import NavBar from "../components/NavBar";
import EventComponent from "../components/EventComponent";
import BookSpot from "../components/BookSpot";

const LandingPage = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showBookSpot, setShowBookSpot] = useState(false);
    const [showAuthInfo, setShowAuthInfo] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check for verification success message in URL params
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const verificationSuccess = queryParams.get('verified');
        
        if (verificationSuccess === 'true') {
            // You can use your notification system here
            // Notify.success('Email verification successful! You can now log in.');
            console.log('Email verification successful');
        }
    }, [location]);

    // Fetch events and update state
    const fetchEvents = useCallback(async () => {
        try {
            const response = await api.get("/event");
            setEvents(response.data);
        } catch (error) {
            console.error("Error fetching events", error);
        }
    }, []);

    // Fetch events on component mount
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Open the BookSpot modal when the user selects an event
    const handleOpenBookSpot = (event) => {
        setSelectedEvent(event);
        setShowBookSpot(true);
    };

    // Toggle auth info modal
    const toggleAuthInfo = () => {
        setShowAuthInfo(!showAuthInfo);
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Image Background Layer */}
            <img
                className="fixed top-0 left-0 w-full h-full object-cover animate-fade z-[-2]"
                src="/bg.gif"
                alt="Background Animation"
            />

            {/* Navigation Bar */}
            <NavBar />

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center text-center py-12 px-6">
                <h1 className="text-5xl mt-22 md:text-7xl font-extrabold text-white drop-shadow-lg">
                    Muong Forum
                </h1>
                <p className="mt-6 text-red-500 font-bold md:text-2xl text-green-300 max-w-2xl">
                    People . History . Culture . Future
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                        className="bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-full text-lg transition transform hover:scale-105 shadow-lg"
                        onClick={() => navigate("/auth")}
                    >
                        Start Now
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-full text-lg transition transform hover:scale-105 shadow-lg flex items-center justify-center"
                        onClick={toggleAuthInfo}
                    >
                        <Info className="mr-2 h-5 w-5" />
                        Account Information
                    </button>
                </div>
            </section>

            {/* Auth Information Modal */}
            {showAuthInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Account Information</h3>
                        
                        <div className="mb-4">
                            <div className="flex items-start mb-2">
                                <Mail className="text-blue-500 mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-gray-800">Email Verification</h4>
                                    <p className="text-sm text-gray-600">
                                        After registration, you'll receive a verification email. Please check your inbox and click the verification link to activate your account.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <div className="flex items-start mb-2">
                                <Key className="text-blue-500 mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-gray-800">Password Reset</h4>
                                    <p className="text-sm text-gray-600">
                                        Forgot your password? You can reset it by clicking the "Forgot password?" link on the login page and following the instructions sent to your email.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end mt-4">
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                onClick={toggleAuthInfo}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Events Section */}
            <section className="relative z-10 max-w-6xl mx-auto py-8 px-6 grid gap-8 md:grid-cols-3">
                {events.length === 0 ? (
                    <div className="col-span-3 text-center">
                        <Loader />
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="p-4 rounded shadow-md bg-white bg-opacity-90">
                            <EventComponent event={event} />
                            <div className="mt-4">
                                <button
                                    onClick={() => handleOpenBookSpot(event)}
                                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                >
                                    Register to Attend
                                </button>
                            </div>

                            <div className="mt-6 flex items-center justify-center space-x-3">
                                {/* Icon with a gentle pulse */}
                                <UserCheck className="w-8 h-8 text-green-500 animate-pulse" />

                                {/* Number and label */}
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                                        {event.registrations?.length ?? 0}
                                    </div>
                                    <div className="uppercase text-sm tracking-wider text-green-800">
                                        {event.registrations && event.registrations.length > 1
                                            ? "Participants Attending"
                                            : "Participant Attending"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* Book Spot Modal */}
            <BookSpot
                visible={showBookSpot}
                event={selectedEvent}
                onCancel={() => setShowBookSpot(false)}
                onSuccess={() => {
                    setShowBookSpot(false);
                    fetchEvents();
                }}
            />

            {/* Authentication Links Section */}
            <section className="relative z-10 py-10 bg-green-800 bg-opacity-80 text-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-lg bg-green-700 bg-opacity-50 transform transition hover:scale-105">
                            <Mail className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Create Account</h3>
                            <p className="mb-4">Register to join our community and get access to exclusive events and content.</p>
                            <button 
                                onClick={() => navigate("/auth")}
                                className="px-4 py-2 bg-white text-green-700 rounded-full font-medium hover:bg-gray-100 transition"
                            >
                                Sign Up
                            </button>
                        </div>
                        
                        <div className="p-6 rounded-lg bg-green-700 bg-opacity-50 transform transition hover:scale-105">
                            <UserCheck className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Verify Email</h3>
                            <p className="mb-4">Already registered but haven't verified your email? Check your inbox for the verification link.</p>
                            <button 
                                onClick={() => navigate("/auth")}
                                className="px-4 py-2 bg-white text-green-700 rounded-full font-medium hover:bg-gray-100 transition"
                            >
                                Sign In
                            </button>
                        </div>
                        
                        <div className="p-6 rounded-lg bg-green-700 bg-opacity-50 transform transition hover:scale-105">
                            <Key className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Reset Password</h3>
                            <p className="mb-4">Forgot your password? No worries, you can easily reset it through our secure system.</p>
                            <button 
                                onClick={() => navigate("/forgot-password")}
                                className="px-4 py-2 bg-white text-green-700 rounded-full font-medium hover:bg-gray-100 transition"
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 text-center py-6 text-gray-200 bg-black bg-opacity-50">
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
                <p>&copy; 2025 Muong Forum. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;