import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookingContext } from '../../contexts/BookingContext';
import '../../styles/BookingDetail.css';

const BookingDetail = () => {
  const { id } = useParams();
  const { getBooking, updateBookingStatus } = useContext(BookingContext);
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Get booking details
    const bookingData = getBooking(parseInt(id));
    
    if (bookingData) {
      setBooking(bookingData);
    } else {
      setError('Booking not found');
    }
    
    setLoading(false);
  }, [id, getBooking]);
  
  const handleStatusChange = (newStatus) => {
    const now = new Date().toISOString();
    let checkInTime = booking.check_in_time;
    let checkOutTime = booking.check_out_time;
    
    if (newStatus === 'checked-in' && !booking.check_in_time) {
      checkInTime = now;
    }
    
    if (newStatus === 'checked-out' && !booking.check_out_time) {
      checkOutTime = now;
    }
    
    updateBookingStatus(booking.booking_id, newStatus, checkInTime, checkOutTime);
    
    // Update local state
    setBooking({
      ...booking,
      status: newStatus,
      check_in_time: checkInTime,
      check_out_time: checkOutTime
    });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };
  
  if (loading) {
    return <div className="loading">Loading booking details...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!booking) {
    return <div className="error-message">Booking not found</div>;
  }
  
  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="booking-detail-container">
      <div className="booking-detail-header">
        <h1>Booking #{booking.booking_id}</h1>
        <div className="header-actions">
          {booking.status === 'confirmed' && (
            <button onClick={() => handleStatusChange('checked-in')} className="check-in-button">
              Check In
            </button>
          )}
          {booking.status === 'checked-in' && (
            <button onClick={() => handleStatusChange('checked-out')} className="check-out-button">
              Check Out
            </button>
          )}
          {(booking.status === 'confirmed' || booking.status === 'checked-in') && (
            <button onClick={() => handleStatusChange('cancelled')} className="cancel-button">
              Cancel Booking
            </button>
          )}
        </div>
      </div>
      
      <div className="booking-status">
        <span className={`status-badge ${booking.status}`}>
          {booking.status}
        </span>
      </div>
      
      <div className="booking-details-grid">
        <div className="detail-card">
          <h2>Guest Information</h2>
          <div className="detail-content">
            <div className="detail-row">
              <div className="detail-label">Name:</div>
              <div className="detail-value">
                <Link to={`/guests/${booking.guest_id}`}>{booking.guest_name}</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="detail-card">
          <h2>Stay Details</h2>
          <div className="detail-content">
            <div className="detail-row">
              <div className="detail-label">Room:</div>
              <div className="detail-value">{booking.room_number} ({booking.room_type})</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Check-in Date:</div>
              <div className="detail-value">{formatDate(booking.check_in_date)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Check-out Date:</div>
              <div className="detail-value">{formatDate(booking.check_out_date)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Nights:</div>
              <div className="detail-value">{nights}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Guests:</div>
              <div className="detail-value">{booking.number_of_guests}</div>
            </div>
          </div>
        </div>
        
        <div className="detail-card">
          <h2>Check-in/Check-out</h2>
          <div className="detail-content">
            <div className="detail-row">
              <div className="detail-label">Check-in Time:</div>
              <div className="detail-value">{formatDateTime(booking.check_in_time)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Check-out Time:</div>
              <div className="detail-value">{formatDateTime(booking.check_out_time)}</div>
            </div>
          </div>
        </div>
        
        <div className="detail-card">
          <h2>Booking Details</h2>
          <div className="detail-content">
            <div className="detail-row">
              <div className="detail-label">Booking Date:</div>
              <div className="detail-value">{formatDate(booking.booking_date)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Source:</div>
              <div className="detail-value">{booking.booking_source}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Special Requests:</div>
              <div className="detail-value">{booking.special_requests || 'None'}</div>
            </div>
          </div>
        </div>
        
        <div className="detail-card wide">
          <h2>Payment</h2>
          <div className="detail-content">
            <div className="detail-row">
              <div className="detail-label">Total Amount:</div>
              <div className="detail-value">${booking.total_amount.toFixed(2)}</div>
            </div>
            {/* In a real application, we would display payment history here */}
          </div>
        </div>
      </div>
      
      <div className="back-link">
        <Link to="/bookings">&larr; Back to Bookings</Link>
      </div>
    </div>
  );
};

export default BookingDetail;