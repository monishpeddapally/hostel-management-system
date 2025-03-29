import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { RoomContext } from '../contexts/RoomContext';
import { BookingContext } from '../contexts/BookingContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { rooms } = useContext(RoomContext);
  const { bookings, getTodayCheckIns, getTodayCheckOuts } = useContext(BookingContext);
  
  // Calculate today's check-ins and check-outs
  const todayCheckIns = getTodayCheckIns();
  const todayCheckOuts = getTodayCheckOuts();
  
  // Calculate available rooms and occupancy rate
  const availableRooms = rooms.filter(room => room.status === 'available').length;
  const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
  const totalRooms = rooms.length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  // Get recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
    .slice(0, 5);
  
  // Current date for display
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
        </div>
        <div className="dashboard-date">
          {currentDate}
        </div>
      </div>
      
      <div className="stats-container">
        <div className="stat-card">
          <h3>Today's Check-ins</h3>
          <div className="stat-value">{todayCheckIns.length}</div>
        </div>
        
        <div className="stat-card">
          <h3>Today's Check-outs</h3>
          <div className="stat-value">{todayCheckOuts.length}</div>
        </div>
        
        <div className="stat-card">
          <h3>Available Rooms</h3>
          <div className="stat-value">{availableRooms}</div>
        </div>
        
        <div className="stat-card">
          <h3>Occupancy Rate</h3>
          <div className="stat-value">{occupancyRate}%</div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <Link to="/bookings/new" className="action-button primary">
          New Booking
        </Link>
        <Link to="/check-in" className="action-button secondary">
          Check-In
        </Link>
        <Link to="/check-out" className="action-button secondary">
          Check-Out
        </Link>
      </div>
      
      <div className="recent-bookings-section">
        <h2>Recent Bookings</h2>
        {recentBookings.length > 0 ? (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(booking => (
                <tr key={booking.booking_id}>
                  <td>#{booking.booking_id}</td>
                  <td>{booking.guest_name}</td>
                  <td>{booking.room_number}</td>
                  <td>{new Date(booking.check_in_date).toLocaleDateString()}</td>
                  <td>{new Date(booking.check_out_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No recent bookings found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;