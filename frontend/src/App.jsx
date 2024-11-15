// src/App.jsx
import { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import Profile from './pages/Profile';
import Register from './pages/UserRegistration';
import Login from './pages/UserLogin';
import CreateClub from './pages/CreateClub';
import Calendar from './pages/Calendar';
import Dashboard from './pages/Dashboard';
import { UserProvider } from './context/UserContext';
import ClubPage from './pages/ClubPage';
import './App.css';

function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const navigate = useNavigate();

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    console.log('Token:', token);
    console.log('IsUserLoggedIn:', !!token);
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
    <UserProvider>
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
                    <button onClick={handleLogout} className="menu-item">
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
            isUserLoggedIn ? <Profile /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/create-club"
          element={
            isUserLoggedIn ? <CreateClub /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/calendar"
          element={
            isUserLoggedIn ? <Calendar /> : <Navigate to="/login" />
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={checkAuth} />} />
        <Route
          path="/"
          element={
            isUserLoggedIn ? <Dashboard /> : <Navigate to="/login" />
          }
        />
        {/* New dynamic route for individual club pages */}
        <Route
          path="/club_pages/:id"
          element={
            isUserLoggedIn ? <ClubPage /> : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
        </main>
      </div>
    </UserProvider>
  );
}

export default App;
