import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';

function ClubPage() {
  const { id } = useParams(); // Get the club ID from the route
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await authenticatedFetch(`http://localhost:5051/api/club/${id}`, {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setClub(data);
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
    <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-center">{club.name}</h2>
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
                    {member.name || "N/A"} - <span className="font-semibold">{member.role}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No members available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClubPage;