import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';
import PosterImage from '../components/PosterImage';
import EventComponent from '../components/EventComponent'; // new import

const Dashboard = () => {
	// Remove custom formData state and use react-hook-form
	const { register, handleSubmit, reset } = useForm({
		defaultValues: {
			title: '',
			eventFocus: '',
			description: '',
			date: '',
			time: '',
			location: '',
			locationType: 'ONSITE',
			guestName: '',
			guestDesc: ''
		}
	});
	const [previewUrl, setPreviewUrl] = useState(null);
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [editingEvent, setEditingEvent] = useState(null);

	// ...existing useEffect for fetching events...
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

	const onSubmit = async (data) => {
		setLoading(true);
		try {
			const formDataToSend = new FormData();
			// Append the file using key "file"
			if (data.eventPoster && data.eventPoster[0]) {
				formDataToSend.append('file', data.eventPoster[0]);
			}
			const formattedDate = new Date(`${data.date}T${data.time}:00.000Z`).toISOString();
			formDataToSend.append('date', formattedDate);
			['title', 'eventFocus', 'description', 'location', 'locationType', 'guestName', 'guestDesc'].forEach(key => {
				formDataToSend.append(key, data[key]);
			});

			if (editingEvent) {
				await api.put(`/event/${editingEvent.id}`, formDataToSend, {
					headers: { 'Content-Type': 'multipart/form-data' }
				});
			} else {
				await api.post('/event', formDataToSend, {
					headers: { 'Content-Type': 'multipart/form-data' }
				});
			}
			reset();
			setPreviewUrl(null);
			setEditingEvent(null);
			fetchEvents();
		} catch (error) {
			console.error('Error submitting form:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (event) => {
		setEditingEvent(event);
		reset(event);
		setPreviewUrl(event.eventPoster);
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
			<form onSubmit={handleSubmit(onSubmit)} className="mb-5">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<input
						type="file"
						{...register('eventPoster', {
							onChange: (e) => {
								const file = e.target.files[0];
								if (file) {
									setPreviewUrl(URL.createObjectURL(file));
								}
							}
						})}
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
						placeholder="Event Title"
						{...register('title', { required: true })}
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="text"
						placeholder="Event Focus"
						{...register('eventFocus', { required: true })}
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="text"
						placeholder="Event Description"
						{...register('description', { required: true })}
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="date"
						{...register('date', { required: true })}
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="time"
						{...register('time', { required: true })}
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="text"
						placeholder="Event Location"
						{...register('location', { required: true })}
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<select
						{...register('locationType', { required: true })}
						className="p-2 border border-gray-300 rounded"
						required
					>
						<option value="ONSITE">ONSITE</option>
						<option value="ONLINE">ONLINE</option>
					</select>
					<input
						type="text"
						placeholder="Guest Name"
						{...register('guestName', { required: true })}
						className="p-2 border border-gray-300 rounded"
						required
					/>
					<input
						type="text"
						placeholder="Guest Desc"
						{...register('guestDesc', { required: true })}
						className="p-2 border border-gray-300 rounded"
						required
					/>
				</div>
				<button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded" disabled={loading}>
					{loading ? 'Submitting...' : editingEvent ? 'Update Event' : 'Create Event'}
				</button>
			</form>
			<h2 className="text-xl font-bold mb-3">Events</h2>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{events.map((event) => (
					<div key={event.id} className="p-4 border border-gray-300 rounded">
						<EventComponent event={event} />
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