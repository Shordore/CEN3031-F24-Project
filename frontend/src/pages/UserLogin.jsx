// src/pages/Login.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';
import PropTypes from 'prop-types';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    ufid: '',
    password: '',
  }); // Stores user input for UFID and password

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Handle input changes and update formData state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Reset error message on input change
  };

  // Handle form submission for user login
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that both UFID and password are provided
    if (!formData.ufid || !formData.password) {
      setError('Please provide both UFID and password.');
      return;
    }

    const loginData = {
      ufid: formData.ufid,
      password: formData.password,
    };

    try {
      setIsLoading(true); // Set loading state to true while making the request

      const response = await authenticatedFetch('http://localhost:5051/api/Account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;

        // Store the authentication token in localStorage for future authenticated requests
        localStorage.setItem('authToken', token);

        if (onLogin) {
          onLogin(); // Callback function after successful login (e.g., to update user context)
        }

        navigate('/profile'); // Redirect the user to the profile page upon successful login
      } else {
        const errorData = await response.text();
        setError(errorData || 'Invalid UFID or password. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false); // Reset loading state after the request completes
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">User Login</h2>

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

        {/* Login Form */}
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

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func,
};

export default Login;
