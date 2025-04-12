import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api";
import EventComponent from "../components/EventComponent";
import ParticipantsModal from "../components/ParticipantsModal";

const Dashboard = () => {
	const { register, handleSubmit, reset } = useForm({
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
	const [editingEvent, setEditingEvent] = useState(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [modalParticipants, setModalParticipants] = useState([]);
	const [modalEventTitle, setModalEventTitle] = useState("");

	const navigate = useNavigate();

	// Session check: if no token, display a message and redirect after a delay.
	useEffect(() => {
		const token = localStorage.getItem("ACCESS_TOKEN");
		if (!token) {
			// Optional: You can use a toast, alert, or simply render a message.
			// For this example, we'll simply wait 3 seconds before redirecting.
			const timer = setTimeout(() => {
				navigate("/auth");
			}, 3000);
			return () => clearTimeout(timer);
		} else {
			fetchEvents();
		}
	}, [navigate]);

	// If no token, render a login message.
	if (!localStorage.getItem("ACCESS_TOKEN")) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">
					Please login to access this site.
				</h2>
				<p className="text-gray-600">Redirecting to login page...</p>
			</div>
		);
	}

	// Fetch events from the backend – the API should include registrations.
	const fetchEvents = async () => {
		try {
			const response = await api.get("/event");
			setEvents(response.data);
		} catch (error) {
			console.error("Error fetching events:", error);
		}
	};

	// Handle form submission for creating/updating events.
	const onSubmit = async (data) => {
		setLoading(true);
		try {
			const formDataToSend = new FormData();
			if (data.eventPoster && data.eventPoster[0]) {
				formDataToSend.append("file", data.eventPoster[0]);
			}
			const formattedDate = new Date(`${data.date}T${data.time}:00.000Z`).toISOString();
			formDataToSend.append("date", formattedDate);
			["title", "eventFocus", "description", "location", "locationType", "guestName", "guestDesc"].forEach(
				(key) => {
					formDataToSend.append(key, data[key]);
				}
			);

			if (editingEvent) {
				await api.put(`/event/${editingEvent.id}`, formDataToSend, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			} else {
				await api.post("/event", formDataToSend, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			}
			reset();
			setPreviewUrl(null);
			setEditingEvent(null);
			fetchEvents();
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (event) => {
		// Extract date and time from ISO date string if necessary
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
	};

	const handleDelete = async (id) => {
		try {
			await api.delete(`/event/${id}`);
			fetchEvents();
		} catch (error) {
			console.error("Error deleting event:", error);
		}
	};

	// Logout: clear tokens and navigate to the auth page.
	const handleLogout = () => {
		localStorage.removeItem("ACCESS_TOKEN");
		localStorage.removeItem("REFRESH_TOKEN");
		localStorage.removeItem("USER");
		navigate("/auth");
	};

	// View participants for an event.
	// If event.registrations exists, use it; else, fetch separately.
	const handleViewParticipants = async (event) => {
		try {
			if (event.registrations) {
				// Extract the participant object from each registration.
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
					<h1 className="text-2xl font-bold text-gray-800">Event Management Dashboard</h1>
					<button
						onClick={handleLogout}
						className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
					>
						Logout
					</button>
				</div>
			</nav>

			<div className="container mx-auto px-4">
				{/* Event Creation / Update Form */}
				<div className="bg-white shadow rounded-lg p-6 mb-8">
					<h2 className="text-xl font-semibold mb-4">
						{editingEvent ? "Update Event" : "Create Event"}
					</h2>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<input
									type="file"
									{...register("eventPoster", {
										onChange: (e) => {
											const file = e.target.files[0];
											if (file) {
												setPreviewUrl(URL.createObjectURL(file));
											}
										},
									})}
									className="p-2 border border-gray-300 rounded w-full"
									required={!editingEvent}
								/>
								{previewUrl && (
									<div className="mt-2">
										<img src={previewUrl} alt="Preview" className="w-32 h-auto rounded" />
									</div>
								)}
							</div>
							<div className="space-y-4">
								<input
									type="text"
									placeholder="Event Title"
									{...register("title", { required: true })}
									className="p-2 border border-gray-300 rounded w-full"
									required
								/>
								<input
									type="text"
									placeholder="Event Focus"
									{...register("eventFocus", { required: true })}
									className="p-2 border border-gray-300 rounded w-full"
									required
								/>
							</div>
							<div className="md:col-span-2">
								<textarea
									placeholder="Event Description"
									{...register("description", { required: true })}
									className="p-2 border border-gray-300 rounded w-full"
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<input
									type="date"
									{...register("date", { required: true })}
									className="p-2 border border-gray-300 rounded w-full"
									required
								/>
								<input
									type="time"
									{...register("time", { required: true })}
									className="p-2 border border-gray-300 rounded w-full"
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<input
									type="text"
									placeholder="Event Location"
									{...register("location", { required: true })}
									className="p-2 border border-gray-300 rounded w-full"
									required
								/>
								<select
									{...register("locationType", { required: true })}
									className="p-2 border border-gray-300 rounded w-full"
									required
								>
									<option value="ONSITE">ONSITE</option>
									<option value="ONLINE">ONLINE</option>
								</select>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<input
									type="text"
									placeholder="Guest Name"
									{...register("guestName", { required: true })}
									className="p-2 border border-gray-300 rounded w-full"
									required
								/>
								<input
									type="text"
									placeholder="Guest Desc"
									{...register("guestDesc", { required: true })}
									className="p-2 border border-gray-300 rounded w-full"
									required
								/>
							</div>
						</div>
						<button
							type="submit"
							className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
							disabled={loading}
						>
							{loading
								? "Submitting..."
								: editingEvent
									? "Update Event"
									: "Create Event"}
						</button>
					</form>
				</div>

				{/* Events Grid */}
				<h2 className="text-xl font-bold mb-4">Events</h2>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{events.map((event) => (
						<div key={event.id} className="bg-white p-4 rounded shadow-md">
							<EventComponent event={event} onInterest={() => handleViewParticipants(event)} />
							<div className="flex items-center justify-between mt-2">
								<button
									onClick={() => handleEdit(event)}
									className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-400 transition"
								>
									Edit
								</button>
								<button
									onClick={() => handleDelete(event.id)}
									className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-400 transition"
								>
									Delete
								</button>
							</div>
							{/* Display participant count from event.registrations */}
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
							<button
								onClick={() => handleViewParticipants(event)}
								className="mt-2 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition"
							>
								View Participants
							</button>
						</div>
					))}
				</div>
			</div>

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