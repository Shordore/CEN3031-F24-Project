// src/pages/ClubPage.jsx

import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';
import { UserContext } from '../context/UserContext';
import EventCreationModal from '../components/EventCreationModal';

function ClubPage() {
  const { id } = useParams(); // Retrieve the club ID from the URL parameters
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, fetchUserProfile } = useContext(UserContext);
  const [showEventCreationModal, setShowEventCreationModal] = useState(false);
  const [events, setEvents] = useState([]);

  // Function to fetch club details and associated events
  const fetchClub = async () => {
    try {
      // Fetch club details from the API
      const response = await authenticatedFetch(`http://localhost:5051/api/club/${id}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setClub(data);

        // Fetch all events from the API
        const eventsResponse = await authenticatedFetch(`http://localhost:5051/api/events`, {
          method: 'GET',
        });

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          // Filter events to include only those belonging to the current club
          const filteredEvents = eventsData.filter((event) => event.clubId == id);
          setEvents(filteredEvents);
        } else {
          console.error('Failed to fetch club events.');
          setEvents([]);
        }
      } else {
        const errorText = await response.text();
        setError(errorText || 'Failed to fetch club details.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred while fetching the club details.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch club details when the component mounts or when the club ID changes
  useEffect(() => {
    fetchClub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Determine if the current user is a member of the club
  const isMember = () => {
    if (!user || !club) return false;
    return user.clubMemberships.some((membership) => membership.clubId === club.id);
  };

  // Determine if the current user is an admin of the club
  const isAdmin = () => {
    if (!user || !club) return false;
    return user.clubMemberships.some(
      (membership) => membership.clubId === club.id && membership.role === 'Admin'
    );
  };

  // Handle the user joining the club
  const handleJoin = async () => {
    try {
      const response = await authenticatedFetch(`http://localhost:5051/api/club/${id}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Successfully joined the club!');
        fetchUserProfile(); // Refresh user profile to update membership status
        fetchClub(); // Refresh club details to reflect the new member
      } else {
        const errorData = await response.text();
        alert(errorData || 'Failed to join the club.');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred while joining the club.');
    }
  };

  // Handle the creation of a new event by adding it to the events state
  const handleEventCreated = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  // Display a loading state while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <div className="text-xl">Loading club details...</div>
      </div>
    );
  }

  // Display an error message if fetching data fails
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <div className="alert alert-error shadow-lg p-4 rounded-md">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-base-200 p-4">
      {/* Club Details Card */}
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6 mb-6">
        <div className="space-y-4">
          {/* Club Name */}
          <h2 className="text-3xl font-bold mb-4 text-center">{club.name}</h2>

          {/* Club Description */}
          <div>
            <h3 className="font-semibold">Description:</h3>
            <p>{club.description || 'No description available.'}</p>
          </div>

          {/* Club Categories */}
          <div>
            <h3 className="font-semibold">Categories:</h3>
            <ul className="list-disc list-inside">
              {club.categories.split(',').map((category) => (
                <li key={category.trim()}>{category.trim()}</li>
              ))}
            </ul>
          </div>

          {/* Club Members */}
          <div>
            <h3 className="font-semibold">Members:</h3>
            {club.members.length > 0 ? (
              <ul className="list-disc list-inside">
                {club.members.map((member) => (
                  <li key={member.userId}>
                    {member.name || 'N/A'} - <span className="font-semibold">{member.role}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No members available.</p>
            )}
          </div>

          {/* Action Buttons: Join Club or Post Event */}
          <div className="flex justify-end space-x-2">
            {/* Show 'Join Club' button if the user is not a member */}
            {!isMember() && (
              <button className="btn btn-primary" onClick={handleJoin}>
                Join Club
              </button>
            )}
            {/* Show 'Post Event' button if the user is an admin */}
            {isAdmin() && (
              <button className="btn btn-success" onClick={() => setShowEventCreationModal(true)}>
                Post Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Display Upcoming Events */}
      {isMember() || isAdmin() ? (
        <div className="w-full max-w-2xl bg-base-100 shadow-xl p-6">
          <h3 className="text-2xl font-semibold mb-4">Upcoming Events</h3>
          {events.length > 0 ? (
            <ul className="space-y-4">
              {events.map((event) => (
                <li key={event.id} className="p-4 border rounded-md">
                  <h4 className="text-xl font-bold">{event.title}</h4>
                  <p className="text-gray-600">{event.description || 'No description available.'}</p>
                  <p className="text-gray-500">
                    <strong>Date & Time:</strong> {new Date(event.dateTime).toLocaleString()}
                  </p>
                  <p className="text-gray-500">
                    <strong>Location:</strong> {event.location || 'TBD'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No events available for this club.</p>
          )}
        </div>
      ) : null}

      {/* Event Creation Modal */}
      {showEventCreationModal && (
        <EventCreationModal
          clubId={club.id}
          onClose={() => setShowEventCreationModal(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
}

export default ClubPage;
