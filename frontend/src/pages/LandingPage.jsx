import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"
import Loader from "../components/Loader"

const LandingPage = () => {
    const [events, setEvents] = React.useState([])
    const [showModal, setShowModal] = React.useState(false)
    const [selectedEvent, setSelectedEvent] = React.useState(null)
    const navigate = useNavigate()

    React.useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get("/event")
                console.log(response.data)
                setEvents(response.data)
            } catch (error) {
                console.error("Error fetching events", error)
            }
        }
        fetchEvents()
    }, [])

    const handleInterest = (id) => {
        const selectedEvent = events.find(event => event.id === id)
        setSelectedEvent(selectedEvent)
        setShowModal(true)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-red-700 text-white">
        {/* Navbar */}
        <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
            <div className="flex items-center ">
                <h1 className="text-2xl font-bold">Landing Page</h1>
            </div>
            <div className="space-x-6">

            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-400 transition" onClick={() => navigate('/auth')}>Sign Up</button>
            </div>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center py-24 px-6">
            <h2 className="text-4xl font-bold leading-tight max-w-3xl">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusamus omnis molestias deserunt, 
            </h2>
            <p className="mt-4 text-lg max-w-xl">Adipisicing elit. Accusamus omnis molestias deserunt,</p>
            <button className="mt-6 bg-green-500 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-400 transition" onClick={() => navigate('/auth')}>
            Start Now
            </button>
        </section>

        {/* Features Section */}
        <section className="max-w-5xl mx-auto py-16 px-6 grid md:grid-cols-3 gap-8 text-black">
            {events.length === 0 ? (
                <div className="col-span-3 text-center">
                    <Loader />
                </div>
            ) : (
                events.map(event => (
                    <div key={event.id} className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                        <p className="text-gray-700 mb-4">{event.description}</p>
                        <p className="text-gray-500 mb-2">{new Date(event.date).toLocaleDateString()}</p>
                        <p className="text-gray-500 mb-2">{event.location}</p>
                        <p className="text-gray-500 mb-2">{event.locationType}</p>
                        <p className="text-gray-500 mb-4">Guest: {event.guestName}</p>
                        <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-400 transition" onClick={() => handleInterest(event.id)}>
                            Book A spot
                        </button>
                    </div>
                ))
            )}
        </section>

        {/* Interest Modal */}
        {showModal && (
            <div className="fixed inset-0 backdrop-blur-3xl flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg text-black shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4">Book a spot in {selectedEvent.title}</h2>
                    <form>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Name</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md"  required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Email</label>
                            <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md"required />
                        </div>
                        <div className="flex justify-end">
                            <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        <footer className="text-center py-6">
            <p>&copy; 2025 John Doe. All rights reserved.</p>
        </footer>
        </div>
    );
};

export default LandingPage;
