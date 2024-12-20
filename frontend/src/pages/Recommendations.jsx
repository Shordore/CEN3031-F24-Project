// src/pages/Recommendations.jsx

import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/api';
import ClubCard from '../components/ClubCard';

function Recommendations() {
  const [recommendedClubs, setRecommendedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch recommended clubs when the component mounts
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await authenticatedFetch('http://localhost:5051/api/Recommendation', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setRecommendedClubs(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch recommendations.');
        }
      } catch {
        setError('An unexpected error occurred while fetching recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Display a loading state while fetching recommendations
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading recommendations...</div>
      </div>
    );
  }

  // Display an error message if fetching recommendations fails
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error shadow-lg">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Recommended Clubs</h1>

      {/* Display the list of recommended clubs */}
      {recommendedClubs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      ) : (
        <p className="text-center">No recommendations available at the moment.</p>
      )}
    </div>
  );
}

export default Recommendations;
