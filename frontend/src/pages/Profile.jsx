// src/pages/Profile.jsx
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

function Profile() {
  const { user, loading, error, updateUserProfile } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    major: '',
    interests: [],
  });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

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

  // Handle Edit Button Click
  const handleEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        grade: user.grade || '',
        major: user.major || '',
        interests: user.interestCategories || [],
      });
      setIsEditing(true);
      setFormError('');
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle Interest Selection
  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  // Handle Form Submission
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    const updatedProfile = {
      name: formData.name,
      grade: formData.grade,
      major: formData.major,
      interestCategories: formData.interests,
    };

    try {
      await updateUserProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setFormError('Failed to update profile.');
    }
  };

  // Handle Cancel Editing
  const handleCancel = () => {
    setIsEditing(false);
    setFormError('');
  };

  const handleCreateClub = () => {
    navigate('/create-club');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

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

  if (!user) {
    return null; // Or some fallback UI
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
        {!isEditing ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-center">User Profile</h2>
            <div>
              <h3 className="font-semibold">Name:</h3>
              <p>{user.name || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Grade:</h3>
              <p>{user.grade || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Major:</h3>
              <p>{user.major || 'N/A'}</p>
            </div>
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

            <div>
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Grade</span>
              </label>
              <select
                name="grade"
                className="select select-bordered w-full"
                value={formData.grade}
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

            <div>
              <label className="label">
                <span className="label-text">Major</span>
              </label>
              <input
                type="text"
                name="major"
                placeholder="Enter your major"
                className="input input-bordered w-full"
                value={formData.major}
                onChange={handleChange}
                required
              />
            </div>

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
                >
                  {availableInterests.map((interest) => (
                    <li key={interest}>
                      <label className="cursor-pointer label">
                        <input
                          type="checkbox"
                          className="checkbox mr-2"
                          checked={formData.interests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                        />
                        {interest}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

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
