import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import PosterImage from '../components/PosterImage';

const Dashboard = () => {
	const [events, setEvents] = useState([]);
	const [formData, setFormData] = useState({
		eventPoster: '',
		title: '',
		eventFocus: '',
		description: '',
		date: '',
		time: '',
		location: '',
		locationType: 'ONSITE',
		guestName: '',
		guestDesc: ''
	});
	const [loading, setLoading] = useState(false);
	const [editingEvent, setEditingEvent] = useState(null);
	const fileInputRef = useRef(null);
	const [previewUrl, setPreviewUrl] = useState(null);

	// Cleanup object URL
	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);
	useEffect(() => {
		fetchEvents();
	}, []);

	const fetchEvents = async () => {
		try {
			const response = await api.get('/event');
			setEvents(response.data);
		} catch (error) {
			console.error('Error fetching events:', error);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		setFormData({ ...formData, eventPoster: file });
		setPreviewUrl(URL.createObjectURL(file));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const formDataToSend = new FormData();
			// Append the file using key "file"
			if (formData.eventPoster) {
				formDataToSend.append('file', formData.eventPoster);
			}
			// Compute ISO date using date and time
			const formattedDate = new Date(`${formData.date}T${formData.time}:00.000Z`).toISOString();
			formDataToSend.append('date', formattedDate);
			// Append other fields except time, date, eventPoster
			const fields = ['title', 'eventFocus', 'description', 'location', 'locationType', 'guestName', 'guestDesc'];
			fields.forEach(key => {
				formDataToSend.append(key, formData[key]);
			});

			if (editingEvent) {
				await api.put(`/event/${editingEvent.id}`, formDataToSend, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
			} else {
				await api.post('/event', formDataToSend, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
			}

			// Reset form and file input
			setFormData({
				eventPoster: '',
				title: '',
				eventFocus: '',
				description: '',
				date: '',
				time: '',
				location: '',
				locationType: 'ONSITE',
				guestName: '',
				guestDesc: ''
			});
			if (fileInputRef.current) fileInputRef.current.value = '';

			setEditingEvent(null);
			fetchEvents();
		} catch (error) {
			console.error('Error submitting form:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (event) => {
		setFormData({ ...event });
		setEditingEvent(event);
	};

	const handleDelete = async (id) => {
		try {
			await api.delete(`/event/${id}`);
			fetchEvents();
		} catch (error) {
			console.error('Error deleting event:', error);
		}
	};

	return (
		<div className="p-5">
			<h1 className="text-2xl font-bold mb-5">Dashboard</h1>
			<form onSubmit={handleSubmit} className="mb-5">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<input
						type="file"
						name="eventPoster"
						ref={fileInputRef}
						onChange={handleFileSelect}
						className="p-2 border border-gray-300 rounded"
						required
					/>
					{/* New preview image render */}
					{previewUrl && (
						<div className="mt-2 col-span-full">
							<img src={previewUrl} alt="Preview" className="w-32 h-auto rounded" />
						</div>
					)}
					<input
						type="text"
						name="title"
						value={formData.title}
						onChange={handleChange}
						placeholder="Event Title"
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="text"
						name="eventFocus"
						value={formData.eventFocus}
						onChange={handleChange}
						placeholder="Event Focus"
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="text"
						name="description"
						value={formData.description}
						onChange={handleChange}
						placeholder="Event Description"
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="date"
						name="date"
						value={formData.date}
						onChange={handleChange}
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="time"
						name="time"
						value={formData.time}
						onChange={handleChange}
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="text"
						name="location"
						value={formData.location}
						onChange={handleChange}
						placeholder="Event Location"
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<select
						name="locationType"
						value={formData.locationType}
						onChange={handleChange}
						className="p-2 border border-gray-300 rounded"
						required
					>
						<option value="ONSITE">ONSITE</option>
						<option value="ONLINE">ONLINE</option>
					</select>
					<input
						type="text"
						name="guestName"
						value={formData.guestName}
						onChange={handleChange}
						placeholder="Guest Name"
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="text"
						name="guestDesc"
						value={formData.guestDesc}
						onChange={handleChange}
						placeholder="Guest Desc"
						className="p-2 border border-gray-300 rounded"
						required
					/>
				</div>
				<button
					type="submit"
					className="mt-4 p-2 bg-blue-500 text-white rounded"
					disabled={loading}
				>
					{loading ? 'Submitting...' : editingEvent ? 'Update Event' : 'Create Event'}
				</button>
			</form>
			<h2 className="text-xl font-bold mb-3">Events</h2>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{events.map((event) => (
					<div key={event.id} className="p-4 border border-gray-300 rounded group hover:border-b-4 active:border-b-4 hover:border-green-500 active:border-green-700 transition-all">
						<h3 className="text-lg font-bold">{event.title}</h3>
						{event.eventPoster && (
							<PosterImage
								src={event.eventPoster}
								alt={event.title}
								className="w-full h-auto mb-2 rounded"
							/>
						)}
						{/* Update each field with active and hover bottom border */}
						<p className="pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
							{event.description}
						</p>
						<p className="pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
							{new Date(event.date).toLocaleDateString()}{' '}
							{new Date(event.date).toLocaleTimeString()}
						</p>
						<p className="pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
							{event.location}
						</p>
						<p className="pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
							{event.locationType}
						</p>
						<p className="pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
							{event.guestName}
						</p>
						<p className="pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
							{event.guestDesc}
						</p>
						<div className="flex justify-between mt-2">
							<button
								onClick={() => handleEdit(event)}
								className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-400 active:bg-yellow-700 transition"
							>
								Edit
							</button>
							<button
								onClick={() => handleDelete(event.id)}
								className="p-2 bg-red-500 text-white rounded hover:bg-red-400 active:bg-red-700 transition"
							>
								Delete
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Dashboard;