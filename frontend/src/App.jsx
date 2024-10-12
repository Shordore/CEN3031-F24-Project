import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom'
import Profile from './pages/Profile'
import Register from './pages/UserRegistration'
import Login from './pages/UserLogin'
import LoginRedirect from './pages/RedirectRegLogin'

import './App.css'

function App() {
  const isUserLoggedIn = false; //TODO: replace with database check once backend is implemented
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <nav className="navbar bg-base-100 shadow-md">
          <div className="flex-1">
            <Link to="/" className="btn btn-ghost normal-case text-xl">
              ClubSwamp
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal p-0">
              {/* <li>
                <Link to="/">Clubs</Link>
              </li>
              <li>
                <Link to="/">Calandar</Link>
              </li> */}
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
              {isUserLoggedIn ? (
                  <Link to="/profile">Profile</Link>
                ) : (
                  <Link to="/pleaselogin">Profile</Link>
                )}
              </li>
            </ul>
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pleaselogin" element={<LoginRedirect />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
