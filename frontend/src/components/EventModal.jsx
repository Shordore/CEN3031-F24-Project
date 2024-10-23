// EventModal.jsx
import React from 'react';

const EventModal = ({ event, onClose }) => {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h2 className="font-bold text-lg font-sans">{event.title}</h2>
        <p className="py-2 font-sans">
          <strong>Club:</strong> {event.club}
        </p>
        <p className="py-2 font-sans">
          <strong>Location:</strong> {event.location}
        </p>
        <p className="py-2 font-sans">
          <strong>Time:</strong> {event.time}
        </p>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
