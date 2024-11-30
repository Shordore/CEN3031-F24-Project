// src/pages/CreateClub.jsx

import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';
import { UserContext } from '../context/UserContext';

function CreateClub() {
  const navigate = useNavigate();

  const [clubData, setClubData] = useState({
    name: '',
    description: '',
    categories: [],
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchUserProfile } = useContext(UserContext);

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
    setError('');
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
    setIsSubmitting(true);
    setError('');
  
    const payload = {
      name: clubData.name,
      description: clubData.description,
      categories: clubData.categories.join(', '),
    };
  
    try {
      const response = await authenticatedFetch('http://localhost:5051/api/Club', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const newClub = await response.json();
        fetchUserProfile(); // Refresh user profile to reflect new club membership
        navigate(`/club_pages/${newClub.id}`);
      } else {
        const errorData = await response.text();
        setError(errorData || 'Failed to create club.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred while creating the club.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile'); // Navigate back to profile without saving
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Create New Club</h2>
        {/* Display error message if any */}
        {error && (
          <div className="alert alert-error shadow-lg mb-4">
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
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Club Name */}
          <div>
            <label className="label">
              <span className="label-text">Club Name</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter club name"
              className="input input-bordered w-full"
              value={clubData.name}
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
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClub;
