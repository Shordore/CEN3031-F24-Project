// src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { authenticatedFetch } from '../utils/api';
import ClubCard from '../components/ClubCard';

function Dashboard() {
  const { user, loading: userLoading, error: userError } = useContext(UserContext);
  const [allClubs, setAllClubs] = useState([]);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [clubsError, setClubsError] = useState('');

  useEffect(() => {
    const fetchAllClubs = async () => {
      setClubsLoading(true);
      setClubsError('');
      try {
        const response = await authenticatedFetch('http://localhost:5051/api/club', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setAllClubs(data);
        } else {
          const errorData = await response.text();
          setClubsError(errorData || 'Failed to fetch clubs.');
        }
      } catch (err) {
        setClubsError('An unexpected error occurred while fetching clubs.');
      } finally {
        setClubsLoading(false);
      }
    };

    fetchAllClubs();
  }, []);

  if (userLoading || clubsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (userError || clubsError) {
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
            <span>{userError || clubsError}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Or some fallback UI
  }

  // Categorize clubs
  const adminClubIds = user.clubMemberships
    .filter((membership) => membership.role === 'Admin')
    .map((membership) => membership.clubId);

  const memberClubIds = user.clubMemberships
    .filter((membership) => membership.role === 'Member')
    .map((membership) => membership.clubId);

  allClubs.forEach((club) => {
    console.log(club);
  });

  console.log('Admin Club IDs:', adminClubIds);

  const adminClubs = allClubs.filter((club) => adminClubIds.includes(club.id));
  const memberClubs = allClubs.filter((club) => memberClubIds.includes(club.id));
  const remainingClubs = allClubs.filter(
    (club) => !adminClubIds.includes(club.id) && !memberClubIds.includes(club.id)
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>

      {/* Admin Clubs */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Clubs You Admin</h2>
        {adminClubs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminClubs.map((club) => (
              <ClubCard key={club.Id} club={club} />
            ))}
          </div>
        ) : (
          <p>You are not an admin of any clubs.</p>
        )}
      </section>

      {/* Member Clubs */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Clubs You Are a Member Of</h2>
        {memberClubs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberClubs.map((club) => (
              <ClubCard key={club.Id} club={club} />
            ))}
          </div>
        ) : (
          <p>You are not a member of any clubs.</p>
        )}
      </section>

      {/* Remaining Clubs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Other Clubs</h2>
        {remainingClubs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {remainingClubs.map((club) => (
              <ClubCard key={club.Id} club={club} />
            ))}
          </div>
        ) : (
          <p>There are no other clubs available.</p>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
