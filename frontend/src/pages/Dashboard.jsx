import React, { useState, useEffect, useRef } from 'react';
import api from '../api';



const Dashboard = () => {
	const [events, setEvents] = useState([]);
	const [formData, setFormData] = useState({
		eventPoster: null,
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


	const [previewUrl, setPreviewUrl] = useState('');
	const [selectedFile, setSelectedFile] = useState(null);

	// Handle file selection
	const handleFileSelect = (event) => {
		const file = event.target.files[0];
		if (!file) return;

		setSelectedFile(file);
		const fileUrl = URL.createObjectURL(file);
		setPreviewUrl(fileUrl);
	};

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
		const { name, value, type, files } = e.target;
		if (type === 'file') {
			setFormData({ ...formData, [name]: files[0] });
		} else {
			setFormData({ ...formData, [name]: value });
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const formattedData = {
				...formData,
				date: new Date(`${formData.date}T${formData.time}:00.000Z`).toISOString()
			};

			if (editingEvent) {
				await api.put(`/event/${editingEvent.id}`, formattedData);
			} else {
				await api.post('/event', formattedData);
			}

			// Reset form and file input
			setFormData({
				eventPoster: null,
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
						onChange={handleChange}
						className="p-2 border border-gray-300 rounded"
						required
					/>
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
					<div key={event.id} className="p-4 border border-gray-300 rounded">
						<h3 className="text-lg font-bold">{event.title}</h3>
						{/* Use the PosterImage component to render the poster */}
						{event.eventPoster && (
								<img
									src={event.eventPoster}
									alt={event.title}
									className="w-full h-auto mb-2 rounded"
								/>
						)}
						<p>{event.description}</p>
						<p>
							{new Date(event.date).toLocaleDateString()}{' '}
							{new Date(event.date).toLocaleTimeString()}
						</p>
						<p>{event.location}</p>
						<p>{event.locationType}</p>
						<p>{event.guestName}</p>
						<p>{ event.guestDesc}</p>
						<div className="flex justify-between mt-2">
							<button
								onClick={() => handleEdit(event)}
								className="p-2 bg-yellow-500 text-white rounded"
							>
								Edit
							</button>
							<button
								onClick={() => handleDelete(event.id)}
								className="p-2 bg-red-500 text-white rounded"
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