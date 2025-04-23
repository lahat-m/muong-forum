// frontend/pages/LandingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck } from "lucide-react";
import api from "../api";
import Loader from "../components/Loader";
import NavBar from "../components/NavBar";
import EventComponent from "../components/EventComponent";
import BookSpot from "../components/BookSpot";

const LandingPage = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showBookSpot, setShowBookSpot] = useState(false);
    const navigate = useNavigate();

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

    return (
        <div className="relative min-h-screen overflow-hidden">

            {/* Image Background Layer (SVG or GIF in public/) */}
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
                <button
                    className="mt-8 bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-full text-lg transition transform hover:scale-105 shadow-lg"
                    onClick={() => navigate("/auth")}
                >
                    Start Now
                </button>
            </section>

            {/* Events Section */}
            <section className="relative z-10 max-w-6xl mx-auto py-8 px-6 grid gap-8 md:grid-cols-3">
                {events.length === 0 ? (
                    <div className="col-span-3 text-center">
                        <Loader />
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="p-4 rounded shadow-md">
                            <EventComponent event={event} />
                            <div className="mt-4">
                                <button
                                    onClick={() => handleOpenBookSpot(event)}
                                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-grey-300 transition"
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

            {/* Footer */}
            <footer className="relative z-10 text-center py-6 text-gray-200">
                <p>
                    Contact us:{" "}
                    <a href="mailto:info@example.com" className="underline hover:text-green-300">
                        info@muongforum.com
                    </a>{" "}
                    | Phone:{" "}
                    <a href="tel:+1234567890" className="underline hover:text-green-300">
                        +254 743 000 000
                    </a>
                </p>
                <p>&copy; 2025 Muong Forum. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;