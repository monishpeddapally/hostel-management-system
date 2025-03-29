import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BookingContext } from '../../contexts/BookingContext';
import { RoomContext } from '../../contexts/RoomContext';
import '../../styles/CheckOut.css';

const CheckOut = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For direct check-out via URL
  
  const { bookings, updateBookingStatus } = useContext(BookingContext);
  const { updateRoomStatus } = useContext(RoomContext);
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [checkInBookings, setCheckInBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingCheckOut, setProcessingCheckOut] = useState(false);
  
  // Get bookings with 'checked-in' status
  useEffect(() => {
    // Get all bookings with status 'checked-in'
    const checkedInBookings = bookings.filter(booking => booking.status === 'checked-in');
    
    setCheckInBookings(checkedInBookings);
    
    // If URL has booking ID, preselect that booking
    if (id) {
      const bookingFromId = bookings.find(b => b.booking_id === parseInt(id));
      if (bookingFromId && bookingFromId.status === 'checked-in') {
        setSelectedBooking(bookingFromId);
      }
    }
    
    setLoading(false);
  }, [bookings, id]);
  
  // Filter bookings by search term
  const filteredBookings = checkInBookings.filter(booking => {
    const search = searchTerm.toLowerCase();
    return (
      booking.guest_name.toLowerCase().includes(search) ||
      booking.room_number.toLowerCase().includes(search) ||
      booking.booking_id.toString().includes(search)
    );
  });
  
  // Handle check-out process
  const handleCheckOut = () => {
    if (!selectedBooking) return;
    
    setProcessingCheckOut(true);
    
    // Get current time for check-out timestamp
    const now = new Date().toISOString();
    
    // Update booking status to 'checked-out'
    updateBookingStatus(selectedBooking.booking_id, 'checked-out', null, now);
    
    // Update room status to 'cleaning'
    updateRoomStatus(selectedBooking.room_id, 'cleaning');
    
    // Navigate to booking details page
    navigate(`/bookings/${selectedBooking.booking_id}`, { 
      state: { message: 'Check-out completed successfully' }
    });
  };
  
  if (loading) {
    return <div className="loading">Loading check-out data...</div>;
  }
  
  return (
    <div className="check-out-container">
      <div className="check-out-header">
        <h1>Guest Check-Out</h1>
      </div>
      
      {checkInBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No checked-in guests to check out.</p>
          <Link to="/bookings" className="view-all-link">
            View All Bookings
          </Link>
        </div>
      ) : (
        <div className="check-out-content">
          <div className="bookings-list-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by guest name, room number, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="bookings-list">
              {filteredBookings.length > 0 ? (
                filteredBookings.map(booking => (
                  <div
                    key={booking.booking_id}
                    className={`booking-item ${selectedBooking && selectedBooking.booking_id === booking.booking_id ? 'selected' : ''}`}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="booking-header">
                      <div className="booking-id">#{booking.booking_id}</div>
                      <div className="room-number">Room {booking.room_number}</div>
                    </div>
                    
                    <div className="guest-name">{booking.guest_name}</div>
                    
                    <div className="booking-info">
                      <div className="check-dates">
                        <div>Check-in: {new Date(booking.check_in_date).toLocaleDateString()}</div>
                        <div>Check-out: {new Date(booking.check_out_date).toLocaleDateString()}</div>
                      </div>
                      <div className="guest-count">{booking.number_of_guests} guests</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  {searchTerm ? 
                    `No bookings found matching "${searchTerm}"` : 
                    'No guests to check-out'}
                </div>
              )}
            </div>
          </div>
          
          <div className="check-out-details-section">
            {selectedBooking ? (
              <div className="selected-booking-details">
                <h2>Check-Out Details</h2>
                
                <div className="guest-info">
                  <div className="info-card">
                    <div className="card-header">
                      <h3>Guest Information</h3>
                    </div>
                    <div className="card-body">
                      <div className="info-row">
                        <div className="info-label">Name:</div>
                        <div className="info-value">{selectedBooking.guest_name}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-card">
                    <div className="card-header">
                      <h3>Booking Information</h3>
                    </div>
                    <div className="card-body">
                      <div className="info-row">
                        <div className="info-label">Booking ID:</div>
                        <div className="info-value">#{selectedBooking.booking_id}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Room:</div>
                        <div className="info-value">{selectedBooking.room_number} ({selectedBooking.room_type})</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Check-in:</div>
                        <div className="info-value">
                          {new Date(selectedBooking.check_in_date).toLocaleDateString()}
                          {selectedBooking.check_in_time && ` at ${new Date(selectedBooking.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                        </div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Check-out:</div>
                        <div className="info-value">{new Date(selectedBooking.check_out_date).toLocaleDateString()}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Nights:</div>
                        <div className="info-value">
                          {Math.ceil(
                            (new Date(selectedBooking.check_out_date) - new Date(selectedBooking.check_in_date)) / 
                            (1000 * 60 * 60 * 24)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="payment-summary">
                  <h3>Payment Summary</h3>
                  <div className="summary-row">
                    <div className="summary-label">Total Amount:</div>
                    <div className="summary-value">${selectedBooking.total_amount.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="check-out-actions">
                  <button 
                    onClick={() => setSelectedBooking(null)} 
                    className="cancel-button"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleCheckOut}
                    disabled={processingCheckOut}
                    className="check-out-button"
                  >
                    {processingCheckOut ? 'Processing...' : 'Complete Check-Out'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-booking-selected">
                <div className="message">
                  <p>Select a booking from the list to proceed with check-out</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckOut;