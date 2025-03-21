import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import GuestList from './components/guests/GuestList';
import RoomList from './components/rooms/RoomList';
import BookingList from './components/bookings/BookingList';
import Reports from './components/reports/Reports';
import NewBooking from './components/bookings/NewBooking';
import CheckIn from './components/operations/CheckIn';
import CheckOut from './components/operations/CheckOut';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="logo">Hostel Management System</div>
          <nav className="main-nav">
            <ul>
              <li>
                <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/guests" className={({ isActive }) => isActive ? 'active' : ''}>
                  Guests
                </NavLink>
              </li>
              <li>
                <NavLink to="/rooms" className={({ isActive }) => isActive ? 'active' : ''}>
                  Rooms
                </NavLink>
              </li>
              <li>
                <NavLink to="/bookings" className={({ isActive }) => isActive ? 'active' : ''}>
                  Bookings
                </NavLink>
              </li>
              <li>
                <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                  Reports
                </NavLink>
              </li>
            </ul>
          </nav>
          <div className="user-info">
            <span className="user-name">Admin User</span>
          </div>
        </header>
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/guests" element={<GuestList />} />
            <Route path="/rooms" element={<RoomList />} />
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/bookings/new" element={<NewBooking />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/check-out" element={<CheckOut />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;