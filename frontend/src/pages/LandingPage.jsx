import React from "react";
import { useNavigate } from "react-router-dom";
import Particles from "react-tsparticles";
import api from "../api";
import Loader from "../components/Loader";
import NavBar from "../components/NavBar";
import EventComponent from "../components/EventComponent";
import BookSpot from "../components/BookSpot.jsx";

const LandingPage = () => {
    const [events, setEvents] = React.useState([]);
    const [showModal, setShowModal] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState(null);
    const [uploadedImage, setUploadedImage] = React.useState(null);
    const navigate = useNavigate();

    React.useEffect(() => {
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

    const handleInterest = (id) => {
        const eventItem = events.find((event) => event.id === id);
        setSelectedEvent(eventItem);
        setShowModal(true);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setUploadedImage(reader.result);
            reader.readAsDataURL(file);
        }
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
            <section className="relative z-10 flex flex-col items-center justify-center text-center py-32 px-6">
                <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg animate-fadeInDown">
                    Discover Extraordinary Experiences
                </h1>
                <p className="mt-6 text-xl md:text-2xl text-gray-200 max-w-2xl animate-fadeInUp">
                    Join us to explore events that inspire creativity, innovation, and community. Your next adventure is just a click away.
                </p>
                <button
                    className="mt-8 bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-full text-lg transition transform hover:scale-105 shadow-lg"
                    onClick={() => navigate('/auth')}
                >
                    Start Now
                </button>
            </section>

            {/* Features Section */}
            <section className="relative z-10 max-w-6xl mx-auto py-16 px-6 grid gap-8 md:grid-cols-3">
                {events.length === 0 ? (
                    <div className="col-span-3 text-center">
                        <Loader />
                    </div>
                ) : (
                    events.map((event) => (
                        <EventComponent key={event.id} event={event} onInterest={handleInterest} />
                    ))
                )}
            </section>

            {/* Interest Modal */}
            <BookSpot
                visible={showModal}
                event={selectedEvent}
                uploadedImage={uploadedImage}
                handleImageUpload={handleImageUpload}
                onCancel={() => setShowModal(false)}
            />

            {/* Footer */}
            <footer className="relative z-10 text-center py-6 text-gray-200">
                <p>
                    Contact us:{" "}
                    <a href="mailto:info@example.com" className="underline hover:text-green-300">
                        info@example.com
                    </a>{" "}
                    | Phone:{" "}
                    <a href="tel:+1234567890" className="underline hover:text-green-300">
                        +1 234 567 890
                    </a>
                </p>
                <p>&copy; 2025 John Doe. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;