import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const EventForm = ({ onSubmit, loading, initialValues }) => {
    const { register, handleSubmit, reset } = useForm({
        defaultValues: initialValues || {
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

    // Reset form when initialValues changes
    useEffect(() => {
        reset(initialValues || {
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
        setPreviewUrl(null);
    }, [initialValues, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                    type="file"
                    {...register('eventPoster', {
                        onChange: (e) => {
                            const file = e.target.files[0];
                            if (file) setPreviewUrl(URL.createObjectURL(file));
                        }
                    })}
                    className="p-2 border border-gray-300 rounded"
                    required
                />
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
                {loading ? 'Submitting...' : initialValues ? 'Update Event' : 'Create Event'}
            </button>
        </form>
    );
};

export default EventForm;
