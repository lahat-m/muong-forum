// frontend/pages/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Particles from "react-tsparticles";
import api from "../api";
import Loader from "../components/Loader";
import NavBar from "../components/NavBar";
import EventComponent from "../components/EventComponent";
import BookSpot from "../components/BookSpot";

const LandingPage = () => {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const navigate = useNavigate();
    const [showBookSpot, setShowBookSpot] = useState(false);


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get("/event");
                setEvents(response.data);
            } catch (error) {
                console.error("Error fetching events", error);
            }
        };
        fetchEvents();
    }, []);


    // When a user wants to book an event, open the BookSpot modal
    const handleOpenBookSpot = (event) => {
        setSelectedEvent(event);
        setShowBookSpot(true);
    };



    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Particle Background */}
            <Particles
                options={{
                    background: { color: { value: "#1a202c" } },
                    fpsLimit: 60,
                    interactivity: {
                        events: { onClick: { enable: true, mode: "push" }, resize: true },
                        modes: { push: { quantity: 4 } },
                    },
                    particles: {
                        color: { value: "#ffffff" },
                        links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.1, width: 1 },
                        collisions: { enable: false },
                        move: { direction: "none", enable: true, outMode: "bounce", random: true, speed: 1 },
                        number: { density: { enable: true, area: 800 }, value: 80 },
                        opacity: { value: 0.5 },
                        shape: { type: "circle" },
                        size: { random: true, value: 3 },
                    },
                    detectRetina: true,
                }}
            />

            {/* Navigation Bar */}
            <NavBar />

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center text-center py-4 px-6">
                <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg">
                    Muong Forum
                </h1>
                <p className="mt-6 text-xl md:text-2xl text-gray-200 max-w-2xl">
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
            <section className="relative z-10 max-w-6xl mx-auto py-4 px-6 grid gap-8 md:grid-cols-3">
                {events.length === 0 ? (
                    <div className="col-span-3 text-center">
                        <Loader />
                    </div>
                ) : (
                    events.map((event) => (
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
                                        {event.registrations.length > 1 ? "s Attending" : ""}
                                    </span>
                                ) : (
                                    <span>0 Participants</span>
                                )}
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
                    // Refresh events so participant counts update
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
                <p>&copy; 2025 Muong Forum. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;