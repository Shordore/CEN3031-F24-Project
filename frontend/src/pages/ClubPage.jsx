// src/pages/ClubPage.jsx
import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';
import { UserContext } from '../context/UserContext';
import EventModal from '../components/EventModal';
import EventCreationModal from '../components/EventCreationModal';

function ClubPage() {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, fetchUserProfile } = useContext(UserContext);
  const [showEventCreationModal, setShowEventCreationModal] = useState(false);
  const [events, setEvents] = useState([]); // To store events related to the club

useEffect(() => {
  const fetchClub = async () => {
    try {
      const response = await authenticatedFetch(`http://localhost:5051/api/club/${id}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setClub(data);

        const eventsResponse = await authenticatedFetch(`http://localhost:5051/api/events`, {
          method: 'GET',
        });

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          const events = eventsData.filter((event) => event.clubId == id);
    
          setEvents(events);
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

  fetchClub();
}, [id]);


  const isMember = () => {
    if (!user || !club) return false;
    return user.clubMemberships.some((membership) => membership.clubId === club.id);
  };

  const isAdmin = () => {
    if (!user || !club) return false;
    return user.clubMemberships.some(
      (membership) => membership.clubId === club.id && membership.role === 'Admin'
    );
  };

  const handleJoin = async () => {
    try {
      const response = await authenticatedFetch(`http://localhost:5051/api/club/${id}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Successfully joined the club!');
        fetchUserProfile();
      } else {
        const errorData = await response.text();
        alert(errorData || 'Failed to join the club.');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred while joining the club.');
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <div className="text-xl">Loading club details...</div>
      </div>
    );
  }

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
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6 mb-6">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold mb-4 text-center">{club.name}</h2>
          <div>
            <h3 className="font-semibold">Description:</h3>
            <p>{club.description || 'No description available.'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Categories:</h3>
            <ul className="list-disc list-inside">
              {club.categories.split(',').map((category) => (
                <li key={category.trim()}>{category.trim()}</li>
              ))}
            </ul>
          </div>
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
          <div className="flex justify-end space-x-2">
            {!isMember() && (
              <button className="btn btn-primary" onClick={handleJoin}>
                Join Club
              </button>
            )}
            {isAdmin() && (
              <button className="btn btn-success" onClick={() => setShowEventCreationModal(true)}>
                Post Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Display Events */}
      <div className="w-full max-w-2xl bg-base-100 shadow-xl p-6">
        <h3 className="text-2xl font-semibold mb-4">Upcoming Events</h3>
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <EventModal key={event.id} event={event} onClose={() => {}} /> // Adjust onClose as needed
            ))}
          </div>
        ) : (
          <p>No events available for this club.</p>
        )}
      </div>

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
