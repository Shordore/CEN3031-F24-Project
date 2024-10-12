import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    ufid: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if the UFID and password are correct (for now, we'll assume any input is valid)
    // In a real application, you'd validate the credentials against a backend service
    if (formData.ufid && formData.password) {
      // Simulate successful login by saving user data in localStorage
      localStorage.setItem('user', JSON.stringify({ ufid: formData.ufid }));

      // Redirect to profile or home page after login
      navigate('/');
    } else {
      alert('Please provide valid UFID and password');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">User Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* UFID Field */}
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

          {/* Password Field */}
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
            <button type="submit" className="btn btn-primary w-full">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;