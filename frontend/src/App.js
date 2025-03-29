import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import GuestList from './components/guests/GuestList';
import GuestForm from './components/guests/GuestForm';
import GuestDetail from './components/guests/GuestDetail';
import RoomList from './components/rooms/RoomList';
import BookingList from './components/bookings/BookingList';
import NewBooking from './components/bookings/NewBooking';
import BookingDetail from './components/bookings/BookingDetail';
import CheckIn from './components/operations/CheckIn';
import CheckOut from './components/operations/CheckOut';
import Reports from './components/reports/Reports';
import { GuestProvider } from './contexts/GuestContext';
import { RoomProvider } from './contexts/RoomContext';
import { BookingProvider } from './contexts/BookingContext';
import './App.css';

function App() {
  return (
    <Router>
      <GuestProvider>
        <RoomProvider>
          <BookingProvider>
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
                  <Route path="/guests/new" element={<GuestForm />} />
                  <Route path="/guests/:id" element={<GuestDetail />} />
                  <Route path="/rooms" element={<RoomList />} />
                  <Route path="/bookings" element={<BookingList />} />
                  <Route path="/bookings/new" element={<NewBooking />} />
                  <Route path="/bookings/:id" element={<BookingDetail />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/check-in" element={<CheckIn />} />
                  <Route path="/check-in/:id" element={<CheckIn />} />
                  <Route path="/check-out" element={<CheckOut />} />
                  <Route path="/check-out/:id" element={<CheckOut />} />
                </Routes>
              </main>
            </div>
          </BookingProvider>
        </RoomProvider>
      </GuestProvider>
    </Router>
  );
}

export default App;