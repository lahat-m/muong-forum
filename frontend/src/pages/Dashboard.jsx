// src/pages/Dashboard.jsx

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
	const [activeTab, setActiveTab] = useState("event");
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("ACCESS_TOKEN");
		if (!token) {
			const timer = setTimeout(() => {
				navigate("/auth");
			}, 3000);
			return () => clearTimeout(timer);
		} else {
			fetchEvents();
		}
	}, [navigate]);

	if (!localStorage.getItem("ACCESS_TOKEN")) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
				<h2 className="text-4xl font-extrabold mb-4">
					Authentication Required
				</h2>
				<p className="text-lg">Redirecting to login page...</p>
			</div>
		);
	}

	// Fetch events from the backend.
	const fetchEvents = async () => {
		try {
			const response = await api.get("/event");
			setEvents(response.data);
		} catch (error) {
			console.error("Error fetching events:", error);
		}
	};

	// Submit new or updated event.
	const onSubmit = async (data) => {
		setLoading(true);
		try {
			const formDataToSend = new FormData();

			// Append the event poster file (if provided)
			if (data.eventPoster && data.eventPoster[0]) {
				// Change "file" to "eventPoster" if your backend requires that field name.
				formDataToSend.append("eventPoster", data.eventPoster[0]);
			}

			// Format the date/time for ISO string
			const formattedDate = new Date(
				`${data.date}T${data.time}:00.000Z`
			).toISOString();
			formDataToSend.append("date", formattedDate);

			// Append other form fields
			["title", "eventFocus", "description", "location", "locationType", "guestName", "guestDesc"].forEach((key) => {
				formDataToSend.append(key, data[key]);
			});

			// DEBUG: Log the FormData contents
			for (let pair of formDataToSend.entries()) {
				console.log(`${pair[0]}: ${pair[1]}`);
			}

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
			setActiveTab("events");
		} catch (error) {
			console.error("Error submitting form:", error);
			alert("Error submitting event. Please check the console for details.");
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
		try {
			await api.delete(`/event/${id}`);
			fetchEvents();
		} catch (error) {
			console.error("Error deleting event:", error);
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
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
			{/* Top Navbar */}
			<nav className="bg-white/80 backdrop-filter backdrop-blur-lg shadow-md py-4 mb-8">
				<div className="container mx-auto flex justify-between items-center px-6">
					<h1 className="text-3xl font-bold text-gray-800">
						<span className="text-indigo-600">Muong</span> Forum
					</h1>
					<button
						onClick={handleLogout}
						className="px-4 py-2 bg-red-500 text-white rounded-full transform hover:scale-105 transition duration-300 shadow"
					>
						Logout
					</button>
				</div>
			</nav>

			{/* Sidebar Tabs */}
			<div className="container mx-auto px-6 flex justify-center mb-8">
				<div className="flex space-x-4">
					<button
						onClick={() => setActiveTab("events")}
						className={`px-6 py-3 rounded-full font-semibold transition duration-300 ${activeTab === "events"
							? "bg-indigo-600 text-white shadow-lg"
							: "bg-white text-gray-800 hover:bg-indigo-100"
							}`}
					>
						My Events
					</button>
					<button
						onClick={() => {
							setActiveTab("new-event");
							if (!editingEvent) reset();
						}}
						className={`px-6 py-3 rounded-full font-semibold transition duration-300 ${activeTab === "new-event"
							? "bg-indigo-600 text-white shadow-lg"
							: "bg-white text-gray-800 hover:bg-indigo-100"
							}`}
					>
						{editingEvent ? "Update Event" : "Create Event"}
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-6">
				{activeTab === "new-event" && (
					<div className="bg-white/90 backdrop-filter backdrop-blur-lg shadow-xl rounded-lg p-6 mb-10">
						<h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
							{editingEvent ? "Update Event" : "Create New Event"}
						</h2>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div>
									<label className="block font-medium text-gray-700 mb-1">
										Event Poster
									</label>
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
										className="w-full p-2 border rounded-lg"
										required={!editingEvent}
									/>
									{previewUrl && (
										<div className="mt-2">
											<img
												src={previewUrl}
												alt="Preview"
												className="w-40 h-auto rounded-lg shadow-lg"
											/>
										</div>
									)}
								</div>
								<div className="space-y-4">
									<input
										type="text"
										placeholder="Event Title"
										{...register("title", { required: true })}
										className="w-full p-2 border rounded-lg"
									/>
									<input
										type="text"
										placeholder="Event Focus"
										{...register("eventFocus", { required: true })}
										className="w-full p-2 border rounded-lg"
									/>
								</div>
							</div>
							<div>
								<textarea
									placeholder="Event Description"
									{...register("description", { required: true })}
									className="w-full p-3 border rounded-lg h-24 resize-none"
								/>
							</div>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<input
									type="date"
									{...register("date", { required: true })}
									className="w-full p-2 border rounded-lg"
								/>
								<input
									type="time"
									{...register("time", { required: true })}
									className="w-full p-2 border rounded-lg"
								/>
							</div>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<input
									type="text"
									placeholder="Event Location"
									{...register("location", { required: true })}
									className="w-full p-2 border rounded-lg"
								/>
								<select
									{...register("locationType", { required: true })}
									className="w-full p-2 border rounded-lg"
								>
									<option value="ONSITE">ONSITE</option>
									<option value="ONLINE">ONLINE</option>
								</select>
							</div>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<input
									type="text"
									placeholder="Guest Name"
									{...register("guestName", { required: true })}
									className="w-full p-2 border rounded-lg"
								/>
								<input
									type="text"
									placeholder="Guest Description"
									{...register("guestDesc", { required: true })}
									className="w-full p-2 border rounded-lg"
								/>
							</div>
							<button
								type="submit"
								className="w-full py-3 mt-4 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition duration-300 shadow-lg"
								disabled={loading}
							>
								{loading ? "Submitting..." : editingEvent ? "Update Event" : "Create Event"}
							</button>
						</form>
					</div>
				)}

				{activeTab === "events" && (
					<div className="space-y-8">
						<h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
							Your Events
						</h2>
						{events.length === 0 ? (
							<p className="text-center text-gray-600">
								No events available, create one to get started.
							</p>
						) : (
							<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
								{events.map((event) => (
									<div
										key={event.id}
										className="bg-white/90 backdrop-filter backdrop-blur-md rounded-xl shadow-lg p-4 transform hover:-translate-y-1 transition duration-300"
									>
										<EventComponent event={event} onInterest={() => handleViewParticipants(event)} />
										<div className="flex justify-between mt-4">
											<button
												onClick={() => handleEdit(event)}
												className="px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-400 transition"
											>
												Edit
											</button>
											<button
												onClick={() => handleDelete(event.id)}
												className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-400 transition"
											>
												Delete
											</button>
										</div>
										<div className="mt-4 text-sm text-gray-700 text-center">
											{event.registrations && event.registrations.length > 0
												? `${event.registrations.length} Participant${event.registrations.length > 1 ? "s" : ""}`
												: "0 Participants"}
										</div>
										<button
											onClick={() => handleViewParticipants(event)}
											className="mt-2 w-full py-2 bg-green-500 text-white rounded-full hover:bg-green-400 transition"
										>
											View Participants
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				)}
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
