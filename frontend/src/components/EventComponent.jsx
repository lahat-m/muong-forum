import React from "react";
import PosterImage from "./PosterImage";

const EventComponent = ({ event, onInterest }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-xl transform transition duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl hover:bg-green-50 group hover:border-b-4 active:border-b-4 hover:border-green-500 active:border-green-700 transition-all">
      {event.eventPoster && (
        <PosterImage
          src={event.eventPoster}
          alt={event.title}
          className="w-full h-48 object-cover mb-4 rounded"
        />
      )}
      <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
      <p className="text-gray-700 mb-2 pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
        {event.eventFocus}
      </p>
      <p className="text-gray-600 mb-4 pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
        {event.description}
      </p>
      <div className="text-gray-500 text-sm space-y-1">
        <p className="pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
          {new Date(event.date).toLocaleDateString()}
        </p>
        <p className="pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
          {event.location}
        </p>
        <p className="pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
          {event.locationType}
        </p>
        <p className="pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
          Guest: {event.guestName}
        </p>
        <p className="pb-1 border-b-2 border-transparent group-hover:border-green-500 active:border-green-700 transition-all">
          Bio: {event.guestDesc}
        </p>
      </div>
      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-400 active:bg-green-700 transition w-full"
        onClick={() => onInterest(event.id)}
      >
        Book A Spot
      </button>
    </div>
  );
};

export default EventComponent;
