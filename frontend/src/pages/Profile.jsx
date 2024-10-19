import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  // will be replaced with data from backend
  const initialProfile = {
    name: 'Cole Smith',
    grade: 'Sophomore',
    major: 'Computer Science',
    interests: ['Technology', 'Music'],
  };

  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

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

  const navigate = useNavigate();

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(formData);
    setIsEditing(false);
    // send to backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(profile);
  };

  const handleCreateClub = () => {
    navigate('/create-club');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
        {!isEditing ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-center">User Profile</h2>
            <div>
              <h3 className="font-semibold">Name:</h3>
              <p>{profile.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Grade:</h3>
              <p>{profile.grade}</p>
            </div>
            <div>
              <h3 className="font-semibold">Major:</h3>
              <p>{profile.major}</p>
            </div>
            <div>
              <h3 className="font-semibold">Interests:</h3>
              <ul className="list-disc list-inside">
                {profile.interests.map((interest) => (
                  <li key={interest}>{interest}</li>
                ))}
              </ul>
            </div>
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
