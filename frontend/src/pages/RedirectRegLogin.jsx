import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotLoggedIn() {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login'); // Redirect to the login page
  };

  const handleRegisterRedirect = () => {
    navigate('/register'); // Redirect to the registration page
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Not Logged In</h2>
        <p className="text-center mb-4">You are not currently logged in. Please log in or register to continue.</p>
        <div className="flex justify-around">
          <button className="btn btn-primary w-40" onClick={handleLoginRedirect}>
            Login
          </button>
          <button className="btn btn-secondary w-40" onClick={handleRegisterRedirect}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotLoggedIn;