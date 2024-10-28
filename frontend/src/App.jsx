import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from 'react-router-dom';
import Profile from './pages/Profile';
import Register from './pages/UserRegistration';
import Login from './pages/UserLogin';
import LoginRedirect from './pages/RedirectRegLogin';
import CreateClub from './pages/CreateClub';
import Calendar from './pages/Calendar';

import './App.css';

function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const navigate = useNavigate();

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    setIsUserLoggedIn(!!token);
  };

  useEffect(() => {
    checkAuth();
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsUserLoggedIn(false);
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="navbar bg-base-100 shadow-md">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost normal-case text-xl">
            ClubSwamp
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal p-0">
            {!isUserLoggedIn && (
              <>
                <li>
                  <Link to="/register" className="menu-item">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="menu-item">
                    Login
                  </Link>
                </li>
              </>
            )}
            {isUserLoggedIn && (
              <>
                <li>
                  <Link to="/calendar" className="menu-item">
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="menu-item">
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="menu-item"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route
            path="/profile"
            element={
              isUserLoggedIn ? <Profile /> : <Navigate to="/please-login" />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={checkAuth} />} />
          <Route path="/please-login" element={<LoginRedirect />} />
          <Route path="/create-club" element={<CreateClub />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
