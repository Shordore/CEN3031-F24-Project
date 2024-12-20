// src/pages/Registration.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';

function Registration() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    ufid: '',
    password: '',
    confirmPassword: '',
    name: '',
    grade: '',
    major: '',
  }); // Stores user input for registration fields

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes and update formData state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  // Handle form submission for user registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    const registrationData = {
      ufid: formData.ufid,
      password: formData.password,
      name: formData.name,
      grade: formData.grade,
      major: formData.major,
    };

    try {
      setIsLoading(true);
      const response = await authenticatedFetch('http://localhost:5051/api/Account/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        alert('Registration successful! Please log in.');
        navigate('/login');
      } else {
        const errorData = await response.text();
        setError(errorData || 'Invalid UFID or password.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">User Registration</h2>

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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* UFID Input Field */}
          <div>
            <label className="label">
              <span className="label-text">UFID</span>
            </label>
            <input
              type="text"
              name="ufid"
              placeholder="Enter your UFID"
              className="input input-bordered w-full"
              value={formData.ufid}
              onChange={handleChange}
              required
            />
          </div>

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
              value={formData.name}
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
              value={formData.grade}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select your grade</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
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
              value={formData.major}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Input Field */}
          <div>
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password Input Field */}
          <div>
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              className="input input-bordered w-full"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registration;
