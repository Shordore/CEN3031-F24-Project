// src/pages/Dashboard.jsx
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { authenticatedFetch } from '../utils/api';
import ClubCard from '../components/ClubCard';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: userLoading, error: userError } = useContext(UserContext);
  const [allClubs, setAllClubs] = useState([]);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [clubsError, setClubsError] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility

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
      } catch {
        setClubsError('An unexpected error occurred while fetching clubs.');
      } finally {
        setClubsLoading(false);
      }
    };

    fetchAllClubs();
  }, []);

  // Fetch search results from the backend
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsDropdownOpen(false);
        return;
      }

      try {
        const response = await authenticatedFetch(
          `http://localhost:5051/api/club/search?query=${encodeURIComponent(searchQuery)}`,
          {
            method: 'GET',
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
          setIsDropdownOpen(true);
        } else {
          setSearchResults([]);
          setIsDropdownOpen(false);
        }
      } catch (err) {
        setSearchResults([]);
        setIsDropdownOpen(false);
        console.error('Error fetching search results:', err);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

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

  const adminClubIds = user.clubMemberships
    .filter((membership) => membership.role === 'Admin')
    .map((membership) => membership.clubId);

  const memberClubIds = user.clubMemberships
    .filter((membership) => membership.role === 'Member')
    .map((membership) => membership.clubId);

  const adminClubs = allClubs.filter((club) => adminClubIds.includes(club.id));
  const memberClubs = allClubs.filter((club) => memberClubIds.includes(club.id));
  const remainingClubs = allClubs.filter(
    (club) => !adminClubIds.includes(club.id) && !memberClubIds.includes(club.id)
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>

      {/* Search Bar with Dropdown */}
<div className="mb-6 relative">
  <input
    type="text"
    placeholder="Search for clubs..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="input input-bordered w-full max-w-md mx-auto block"
  />
  {isDropdownOpen && searchResults.length > 0 && (
    <ul className="absolute bg-white border border-gray-300 rounded-md shadow-lg w-full max-w-md mt-2 mx-auto left-1/2 transform -translate-x-1/2 z-10">
      {searchResults.map((club) => (
        <li
          key={club.id}
          className="p-4 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            navigate(`/club_pages/${club.id}`);
            setSearchQuery('');
            setIsDropdownOpen(false);
          }}
        >
          <strong className="text-lg">{club.name}</strong>
          <p className="text-sm text-gray-500">{club.description}</p>
        </li>
      ))}
    </ul>
  )}
</div>

      {/* Admin Clubs */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Clubs You Admin</h2>
        {adminClubs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminClubs.map((club) => (
              console.log(club.id),
              <ClubCard key={club.id.toString()} club={club} />
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
              <ClubCard key={club.id.toString()} club={club} />
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
              console.log(club.id),
              <ClubCard key={club.id.toString()} club={club} />
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