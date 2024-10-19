import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateClub() {
  const navigate = useNavigate();

  const [clubData, setClubData] = useState({
    clubName: '',
    description: '',
    categories: [],
    // members: [], // for future
  });

  const availableCategories = [
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClubData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleCategory = (category) => {
    setClubData((prev) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // when backend is ready, send to api
      navigate('/profile');
    } catch (error) {
      // Handle error (show a notification)
      console.error(error);
    }
  };

  const handleCancel = () => {
    navigate('/profile'); // Navigate back to profile without saving
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Create New Club</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Club Name */}
          <div>
            <label className="label">
              <span className="label-text">Club Name</span>
            </label>
            <input
              type="text"
              name="clubName"
              placeholder="Enter club name"
              className="input input-bordered w-full"
              value={clubData.clubName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              placeholder="Enter club description"
              className="textarea textarea-bordered w-full"
              value={clubData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Categories */}
          <div>
            <label className="label">
              <span className="label-text">Categories</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={clubData.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Club
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClub;
