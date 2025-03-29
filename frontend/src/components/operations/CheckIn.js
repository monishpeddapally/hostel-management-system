import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BookingContext } from '../../contexts/BookingContext';
import { RoomContext } from '../../contexts/RoomContext';
import '../../styles/CheckIn.css';

const CheckIn = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For direct check-in via URL
  
  const { bookings, updateBookingStatus } = useContext(BookingContext);
  const { updateRoomStatus } = useContext(RoomContext);
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingCheckIn, setProcessingCheckIn] = useState(false);
  
  // Get today's bookings with 'confirmed' status
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get bookings with check-in date today and status 'confirmed'
    const confirmedBookings = bookings.filter(booking => 
      booking.check_in_date === today && booking.status === 'confirmed'
    );
    
    setTodayBookings(confirmedBookings);
    
    // If URL has booking ID, preselect that booking
    if (id) {
      const bookingFromId = bookings.find(b => b.booking_id === parseInt(id));
      if (bookingFromId && bookingFromId.status === 'confirmed') {
        setSelectedBooking(bookingFromId);
      }
    }
    
    setLoading(false);
  }, [bookings, id]);
  
  // Filter bookings by search term
  const filteredBookings = todayBookings.filter(booking => {
    const search = searchTerm.toLowerCase();
    return (
      booking.guest_name.toLowerCase().includes(search) ||
      booking.room_number.toLowerCase().includes(search) ||
      booking.booking_id.toString().includes(search)
    );
  });
  
  // Handle check-in process
  const handleCheckIn = () => {
    if (!selectedBooking) return;
    
    setProcessingCheckIn(true);
    
    // Get current time for check-in timestamp
    const now = new Date().toISOString();
    
    // Update booking status to 'checked-in'
    updateBookingStatus(selectedBooking.booking_id, 'checked-in', now);
    
    // Update room status to 'occupied'
    updateRoomStatus(selectedBooking.room_id, 'occupied');
    
    // Navigate to booking details page
    navigate(`/bookings/${selectedBooking.booking_id}`, { 
      state: { message: 'Check-in completed successfully' }
    });
  };
  
  if (loading) {
    return <div className="loading">Loading check-in data...</div>;
  }
  
  return (
    <div className="check-in-container">
      <div className="check-in-header">
        <h1>Guest Check-In</h1>
      </div>
      
      {todayBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings to check in today.</p>
          <Link to="/bookings" className="view-all-link">
            View All Bookings
          </Link>
        </div>
      ) : (
        <div className="check-in-content">
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
                    'No bookings to check-in today'}
                </div>
              )}
            </div>
          </div>
          
          <div className="check-in-details-section">
            {selectedBooking ? (
              <div className="selected-booking-details">
                <h2>Check-In Details</h2>
                
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
                        <div className="info-label">Check-in Date:</div>
                        <div className="info-value">{new Date(selectedBooking.check_in_date).toLocaleDateString()}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Check-out Date:</div>
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
                      <div className="info-row">
                        <div className="info-label">Guests:</div>
                        <div className="info-value">{selectedBooking.number_of_guests}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Total Amount:</div>
                        <div className="info-value">${selectedBooking.total_amount.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="check-in-actions">
                  <button 
                    onClick={() => setSelectedBooking(null)} 
                    className="cancel-button"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleCheckIn}
                    disabled={processingCheckIn}
                    className="check-in-button"
                  >
                    {processingCheckIn ? 'Processing...' : 'Complete Check-In'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-booking-selected">
                <div className="message">
                  <p>Select a booking from the list to proceed with check-in</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckIn;