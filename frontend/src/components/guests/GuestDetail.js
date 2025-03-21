import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GuestContext } from '../../contexts/GuestContext';
import '../../styles/GuestDetail.css';

const GuestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGuest } = useContext(GuestContext);
  
  const [guest, setGuest] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Get guest from context
    const guestData = getGuest(id);
    
    if (guestData) {
      setGuest(guestData);
      
      // For now, use mock booking data
      const mockBookings = [
        {
          booking_id: 101,
          check_in_date: '2025-02-10',
          check_out_date: '2025-02-15',
          room_number: '101',
          total_amount: 500,
          status: 'confirmed'
        },
        {
          booking_id: 102,
          check_in_date: '2024-12-20',
          check_out_date: '2024-12-27',
          room_number: '203',
          total_amount: 700,
          status: 'checked-out'
        }
      ];
      
      setBookings(mockBookings);
    } else {
      setError('Guest not found');
    }
    
    setLoading(false);
  }, [id, getGuest]);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return <div className="loading">Loading guest details...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!guest) {
    return <div className="error-message">Guest not found.</div>;
  }
  
  return (
    <div className="guest-detail-container">
      {/* Rest of your component remains the same */}
      <div className="guest-detail-header">
        <h1>{guest.first_name} {guest.last_name}</h1>
        <div className="header-actions">
          <Link to={`/guests/${guest.guest_id}/edit`} className="edit-button">Edit</Link>
          <Link to={`/bookings/new?guestId=${guest.guest_id}`} className="new-booking-button">New Booking</Link>
        </div>
      </div>
      
      <div className="guest-info-section">
        <div className="info-card">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{guest.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone:</span>
              <span className="info-value">{guest.phone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Address:</span>
              <span className="info-value">{guest.address || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date of Birth:</span>
              <span className="info-value">{guest.date_of_birth ? formatDate(guest.date_of_birth) : 'Not provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Nationality:</span>
              <span className="info-value">{guest.nationality}</span>
            </div>
          </div>
        </div>
        
        <div className="info-card">
          <h2>Identification</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">ID Type:</span>
              <span className="info-value">
                {guest.id_proof_type === 'passport' ? 'Passport' : 
                 guest.id_proof_type === 'drivers_license' ? 'Driver\'s License' :
                 guest.id_proof_type === 'national_id' ? 'National ID' : 
                 guest.id_proof_type}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">ID Number:</span>
              <span className="info-value">{guest.id_proof_number}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="booking-history-section">
        <h2>Booking History</h2>
        
        {bookings.length > 0 ? (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Room</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.booking_id}>
                  <td>#{booking.booking_id}</td>
                  <td>{formatDate(booking.check_in_date)}</td>
                  <td>{formatDate(booking.check_out_date)}</td>
                  <td>{booking.room_number}</td>
                  <td>${booking.total_amount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/bookings/${booking.booking_id}`} className="view-button">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-bookings">
            No booking history found for this guest.
          </div>
        )}
      </div>
      <div className="back-link">
        <Link to="/guests">&larr; Back to Guest List</Link>
      </div>
    </div>
  );
};

export default GuestDetail;