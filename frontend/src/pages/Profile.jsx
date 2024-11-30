// src/pages/Profile.jsx

import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

function Profile() {
  const { user, loading, error, updateUserProfile, fetchUserProfile } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    major: '',
    interests: [],
  });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  // Fetch the latest user profile when the component mounts
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const availableInterests = [
    'Technology',
    'Art',
    'Science',
    'Sports',
    'Music',
    'Travel',
    'Reading',
    'Gaming',
    'Cooking',
    'Fitness',
  ];

  // Display a loading state while fetching user data
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  // Handle Edit Button Click to enable edit mode and populate form with existing user data
  const handleEdit = () => {
    setFormData({
      name: user.name || '',
      grade: user.grade || '',
      major: user.major || '',
      interests: user.interestCategories || [],
    });
    setIsEditing(true);
    setFormError('');
  };

  // Handle Input Change for text and select fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle Interest Selection by adding or removing interests from the form data
  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  // Handle Form Submission to update the user profile
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    const updatedProfile = {
      name: formData.name || '',
      grade: formData.grade || '',
      major: formData.major || '',
      interestCategories: formData.interests || [],
    };

    try {
      await updateUserProfile(updatedProfile); // Update the user profile via context
      setIsEditing(false);
    } catch {
      setFormError('Failed to update profile.'); // Display an error message if update fails
    }
  };

  // Handle Cancel Editing by reverting back to view mode without saving changes
  const handleCancel = () => {
    setIsEditing(false);
    setFormError('');
  };

  // Navigate to the Create Club page
  const handleCreateClub = () => {
    navigate('/create-club');
  };

  // Display an error message if there's an error fetching or updating the profile
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
    <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
        {/* Display Profile Information when not in edit mode */}
        {!isEditing && user ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-center">User Profile</h2>
            {/* User Name */}
            <div>
              <h3 className="font-semibold">Name:</h3>
              <p>{user.name || 'N/A'}</p>
            </div>
            {/* User Grade */}
            <div>
              <h3 className="font-semibold">Grade:</h3>
              <p>{user.grade || 'N/A'}</p>
            </div>
            {/* User Major */}
            <div>
              <h3 className="font-semibold">Major:</h3>
              <p>{user.major || 'N/A'}</p>
            </div>
            {/* User Interests */}
            <div>
              <h3 className="font-semibold">Interests:</h3>
              <ul className="list-disc list-inside">
                {user.interestCategories.length > 0 ? (
                  user.interestCategories.map((interest) => (
                    <li key={interest}>{interest}</li>
                  ))
                ) : (
                  <li>No interests selected.</li>
                )}
              </ul>
            </div>
            {/* Display form error message if any */}
            {formError && (
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
                  <span>{formError}</span>
                </div>
              </div>
            )}
            {/* Action Buttons: Edit Profile and Create New Club */}
            <div className="flex flex-col space-y-2">
              <button className="btn btn-primary" onClick={handleEdit}>
                Edit Profile
              </button>
              <button className="btn btn-secondary" onClick={handleCreateClub}>
                Create New Club
              </button>
            </div>
          </div>
        ) : (
          /* Display Edit Profile Form when in edit mode */
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>

            {/* Display form error message if any */}
            {formError && (
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
                  <span>{formError}</span>
                </div>
              </div>
            )}

            {/* Name Input Field */}
            <div>
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                className="input input-bordered w-full"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </div>

            {/* Grade Select Field */}
            <div>
              <label className="label">
                <span className="label-text">Grade</span>
              </label>
              <select
                name="grade"
                className="select select-bordered w-full"
                value={formData.grade || ''}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select your grade
                </option>
                <option>Freshman</option>
                <option>Sophomore</option>
                <option>Junior</option>
                <option>Senior</option>
                <option>Graduate</option>
              </select>
            </div>

            {/* Major Input Field */}
            <div>
              <label className="label">
                <span className="label-text">Major</span>
              </label>
              <input
                type="text"
                name="major"
                placeholder="Enter your major"
                className="input input-bordered w-full"
                value={formData.major || ''}
                onChange={handleChange}
                required
              />
            </div>

            {/* Interests Selection */}
            <div className="relative">
              <label className="label">
                <span className="label-text">Interests</span>
              </label>
              <div className="dropdown dropdown-hover w-full">
                <label tabIndex={0} className="btn btn-outline w-full text-left">
                  {formData.interests.length > 0
                    ? `${formData.interests.length} Interest(s) Selected`
                    : 'Select Interests'}
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto"
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    zIndex: 50,
                  }}
                >
                  {availableInterests.map((interest) => (
                    <li key={interest}>
                      <label className="cursor-pointer label">
                        <input
                          type="checkbox"
                          className="checkbox mr-2"
                          checked={formData.interests && formData.interests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                        />
                        {interest}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons: Cancel and Save */}
            <div className="flex justify-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
