// EventModal.jsx

import PropTypes from 'prop-types';

const EventModal = ({ event, onClose }) => {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div key={event.id} className="p-4 border rounded-md">
          <h4 className="text-xl font-bold">{event.title}</h4>
          <p className="text-gray-600">{event.description || 'No description available.'}</p>
          <p className="text-gray-500">
            <strong>Date & Time:</strong> {new Date(event.dateTime).toLocaleString()}
          </p>
          <p className="text-gray-500">
            <strong>Location:</strong> {event.location || 'TBD'}
          </p>
        </div>
        
        {/* Close Button */}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

EventModal.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    location: PropTypes.string,
    dateTime: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EventModal;
