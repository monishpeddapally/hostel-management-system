import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayCheckIns: 0,
    todayCheckOuts: 0,
    availableRooms: 0,
    occupancyRate: 0
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Replace with your actual API endpoints
        const response = await axios.get('http://localhost:3001/api/dashboard/stats');
        setStats(response.data);
        
        const bookingsResponse = await axios.get('http://localhost:3001/api/bookings?limit=5');
        setRecentBookings(bookingsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    // For now, use mock data since our endpoints might not be ready
    const mockData = () => {
      setStats({
        todayCheckIns: 5,
        todayCheckOuts: 3,
        availableRooms: 12,
        occupancyRate: 68
      });
      
      setRecentBookings([
        {
          booking_id: 1,
          first_name: 'John',
          last_name: 'Doe',
          check_in_date: '2025-03-20',
          check_out_date: '2025-03-25',
          room_number: '101',
          status: 'confirmed'
        },
        {
          booking_id: 2,
          first_name: 'Jane',
          last_name: 'Smith',
          check_in_date: '2025-03-21',
          check_out_date: '2025-03-23',
          room_number: '102',
          status: 'checked-in'
        },
        {
          booking_id: 3,
          first_name: 'Michael',
          last_name: 'Johnson',
          check_in_date: '2025-03-19',
          check_out_date: '2025-03-22',
          room_number: '103',
          status: 'checked-out'
        },
        {
          booking_id: 4,
          first_name: 'Sarah',
          last_name: 'Williams',
          check_in_date: '2025-03-22',
          check_out_date: '2025-03-26',
          room_number: '104',
          status: 'confirmed'
        },
        {
          booking_id: 5,
          first_name: 'Robert',
          last_name: 'Brown',
          check_in_date: '2025-03-18',
          check_out_date: '2025-03-21',
          room_number: '105',
          status: 'checked-out'
        }
      ]);
      
      setLoading(false);
    };
    
    // Use mock data for now
    mockData();
    
    // Uncomment this when your API is ready
    // fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

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
          <div className="stat-value">{stats.todayCheckIns}</div>
        </div>
        
        <div className="stat-card">
          <h3>Today's Check-outs</h3>
          <div className="stat-value">{stats.todayCheckOuts}</div>
        </div>
        
        <div className="stat-card">
          <h3>Available Rooms</h3>
          <div className="stat-value">{stats.availableRooms}</div>
        </div>
        
        <div className="stat-card">
          <h3>Occupancy Rate</h3>
          <div className="stat-value">{stats.occupancyRate}%</div>
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
                  <td>{booking.first_name} {booking.last_name}</td>
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