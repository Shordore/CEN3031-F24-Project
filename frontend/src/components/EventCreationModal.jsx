// src/components/EventCreationModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { authenticatedFetch } from '../utils/api';

const EventCreationModal = ({ clubId, onClose, onEventCreated }) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    datetime: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic validation
    if (!eventData.title || !eventData.datetime) {
      setError('Please provide at least a title and date/time for the event.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      clubId: clubId,
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      datetime: eventData.datetime,
    };

    try {
      const response = await authenticatedFetch('http://localhost:5051/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newEvent = await response.json();
        onEventCreated(newEvent);
        onClose();
      } else {
        const errorData = await response.text();
        setError(errorData || 'Failed to create event.');
      }
    } catch (err) {
      setError('An unexpected error occurred while creating the event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Create New Event</h3>
        {error && (
          <div className="alert alert-error shadow-lg my-2">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M12 4v16m8-8H4"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Event Title"
              className="input input-bordered w-full"
              value={eventData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              placeholder="Event Description"
              className="textarea textarea-bordered w-full"
              value={eventData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Location */}
          <div>
            <label className="label">
              <span className="label-text">Location</span>
            </label>
            <input
              type="text"
              name="location"
              placeholder="Event Location"
              className="input input-bordered w-full"
              value={eventData.location}
              onChange={handleChange}
            />
          </div>

          {/* Date/Time */}
          <div>
            <label className="label">
              <span className="label-text">Date and Time</span>
            </label>
            <input
              type="datetime-local"
              name="datetime"
              className="input input-bordered w-full"
              value={eventData.datetime}
              onChange={handleChange}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EventCreationModal.propTypes = {
  clubId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onEventCreated: PropTypes.func.isRequired,
};

export default EventCreationModal;
