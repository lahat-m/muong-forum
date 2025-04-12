import React from "react";
import PropTypes from 'prop-types';

// Optional: fallback poster image if none is provided
const PosterImage = ({ src, alt }) => (
  <img
    src={src || "/default-poster.jpg"} // fallback image
    alt={alt}
    className="w-full h-48 object-cover mb-4 rounded"
    loading="lazy"
  />
);

const EventComponent = ({ event, onInterest }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-xl transform transition duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl hover:bg-green-50 group hover:border-b-4 active:border-b-4 hover:border-green-500 active:border-green-700">
      {event.eventPoster && (
        <PosterImage src={event.eventPoster} alt={event.title} />
      )}
      <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
      <p className="text-gray-700 mb-2 border-b group-hover:border-green-500">
        {event.eventFocus}
      </p>
      <p className="text-gray-600 mb-4 border-b group-hover:border-green-500">
        {event.description}
      </p>
      <div className="text-gray-500 text-sm space-y-1">
        <p className="border-b group-hover:border-green-500">
          {new Date(event.date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="border-b group-hover:border-green-500">{event.location}</p>
        <p className="border-b group-hover:border-green-500">{event.locationType}</p>
        <p className="border-b group-hover:border-green-500">
          <span className="font-semibold">Guest:</span> {event.guestName}
        </p>
        <p className="border-b group-hover:border-green-500">
          <span className="font-semibold">Bio:</span> {event.guestDesc}
        </p>
      </div>
      {onInterest && (
        <button
          onClick={() => onInterest(event.id)}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-400 active:bg-green-700 transition w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Book A Spot
        </button>
      )}
    </div>
  );
};


EventComponent.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    eventPoster: PropTypes.string,
    eventFocus: PropTypes.string,
    description: PropTypes.string,
    date: PropTypes.string.isRequired,
    location: PropTypes.string,
    locationType: PropTypes.string,
    guestName: PropTypes.string,
    guestDesc: PropTypes.string,
  }).isRequired,
  onInterest: PropTypes.func,
};


export default EventComponent;