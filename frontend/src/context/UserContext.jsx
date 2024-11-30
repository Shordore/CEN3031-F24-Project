// src/context/UserContext.jsx
import { createContext, useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';

// Create the context
export const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user profile data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state
  const navigate = useNavigate();

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedFetch('http://localhost:5051/api/Account/me', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure clubMemberships is an array; adjust based on actual API response
        setUser({
          ...data,
          clubMemberships: data.clubMemberships || [], // Assuming the API returns clubMemberships
        });
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        const errorData = await response.text();
        setError(errorData || 'Failed to fetch profile.');
      }
    } catch {
      setError('An unexpected error occurred while fetching profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const updateUserProfile = async (updatedProfile) => {
    setLoading(true);
    setError('');
      const response = await authenticatedFetch('http://localhost:5051/api/Account/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          ...data,
          clubMemberships: data.clubMemberships || [],
        });
      } else {
        const errorData = await response.text();
        setError(errorData || 'Failed to update profile.');
      }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        fetchUserProfile,
        updateUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
