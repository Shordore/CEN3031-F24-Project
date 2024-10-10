import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom'
import Profile from './pages/Profile'

import './App.css'

function App() {
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
                <Link to="/profile">Profile</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
