// src/context/UserContext.jsx

import { createContext, useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export const UserContext = createContext();

// UserProvider component that wraps around parts of the app that need access to user data
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to fetch the current user's profile from the API
  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedFetch('http://localhost:5051/api/Account/me', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else if (response.status === 401) {
        // If unauthorized, redirect the user to the login page
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

  // Fetch the user profile when the component mounts
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Function to update the user's profile
  const updateUserProfile = async (updatedProfile) => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedFetch('http://localhost:5051/api/Account/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        setUser({
          ...user,
          name: updatedProfile.name,
          grade: updatedProfile.grade,
          major: updatedProfile.major,
          interestCategories: updatedProfile.interestCategories
        });
      } else {
        const errorData = await response.text();
        setError(errorData || 'Failed to update profile.');
      }
    } catch {
      setError('An unexpected error occurred while updating profile.');
    } finally {
      setLoading(false);
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

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
