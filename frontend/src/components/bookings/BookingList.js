import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { BookingContext } from '../../contexts/BookingContext';
import '../../styles/BookingList.css';

const BookingList = () => {
  const { bookings } = useContext(BookingContext);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize filtered bookings when component mounts
  useEffect(() => {
    setFilteredBookings(bookings);
    setLoading(false);
  }, [bookings]);
  
  // Filter bookings based on status, date range, and search term
  useEffect(() => {
    let results = [...bookings];
    
    // Filter by status
    if (statusFilter !== 'all') {
      results = results.filter(booking => booking.status === statusFilter);
    }
    
    // Filter by date range
    if (dateRange.start && dateRange.end) {
      results = results.filter(booking => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        return (
          (checkIn >= startDate && checkIn <= endDate) ||
          (checkOut >= startDate && checkOut <= endDate) ||
          (checkIn <= startDate && checkOut >= endDate)
        );
      });
    }
    
    // Filter by search term (guest name, room number, booking ID)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      results = results.filter(booking => 
        booking.guest_name.toLowerCase().includes(search) ||
        booking.room_number.toLowerCase().includes(search) ||
        booking.booking_id.toString().includes(search)
      );
    }
    
    setFilteredBookings(results);
  }, [bookings, statusFilter, dateRange, searchTerm]);
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const clearFilters = () => {
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setSearchTerm('');
  };
  
  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }
  
  return (
    <div className="booking-list-container">
      <div className="booking-list-header">
        <h1>Bookings</h1>
        <Link to="/bookings/new" className="new-booking-button">New Booking</Link>
      </div>
      
      <div className="booking-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by guest name, room number, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-options">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="date-range">
            <div className="filter-group">
              <label>From:</label>
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
              />
            </div>
            
            <div className="filter-group">
              <label>To:</label>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
              />
            </div>
          </div>
          
          <button className="clear-filters" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          No bookings match your filters. Try adjusting your search criteria.
        </div>
      ) : (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Nights</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => {
              const checkIn = new Date(booking.check_in_date);
              const checkOut = new Date(booking.check_out_date);
              const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
              
              return (
                <tr key={booking.booking_id}>
                  <td>#{booking.booking_id}</td>
                  <td>{booking.guest_name}</td>
                  <td>{booking.room_number}</td>
                  <td>{checkIn.toLocaleDateString()}</td>
                  <td>{checkOut.toLocaleDateString()}</td>
                  <td>{nights}</td>
                  <td>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>${booking.total_amount.toFixed(2)}</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/bookings/${booking.booking_id}`} className="view-button">
                        View
                      </Link>
                      
                      {booking.status === 'confirmed' && (
                        <Link to={`/check-in/${booking.booking_id}`} className="check-in-button">
                          Check In
                        </Link>
                      )}
                      
                      {booking.status === 'checked-in' && (
                        <Link to={`/check-out/${booking.booking_id}`} className="check-out-button">
                          Check Out
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingList;