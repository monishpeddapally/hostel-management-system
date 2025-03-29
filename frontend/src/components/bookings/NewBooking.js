import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GuestContext } from '../../contexts/GuestContext';
import { RoomContext } from '../../contexts/RoomContext';
import { BookingContext } from '../../contexts/BookingContext';
import '../../styles/NewBooking.css';

const NewBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const preselectedGuestId = searchParams.get('guestId');
  
  const { guests, getGuest } = useContext(GuestContext);
  const { rooms, getRoom } = useContext(RoomContext);
  const { addBooking } = useContext(BookingContext);
  
  const [formData, setFormData] = useState({
    guest_id: preselectedGuestId || '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    number_of_guests: 1,
    booking_source: 'direct',
    special_requests: '',
    total_amount: 0
  });
  
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [guestSearchTerm, setGuestSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Initialize the selected guest if guestId is provided in URL
  useEffect(() => {
    if (preselectedGuestId) {
      const guest = getGuest(preselectedGuestId);
      if (guest) {
        setSelectedGuest(guest);
      }
    }
  }, [preselectedGuestId, getGuest]);
  
  // Filter guests based on search term
  useEffect(() => {
    if (guestSearchTerm.trim() === '') {
      setFilteredGuests(guests);
    } else {
      const searchValue = guestSearchTerm.toLowerCase();
      const filtered = guests.filter(guest => {
        const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
        const email = guest.email.toLowerCase();
        const phone = guest.phone ? guest.phone.toLowerCase() : '';
        
        return fullName.includes(searchValue) || 
               email.includes(searchValue) || 
               phone.includes(searchValue);
      });
      setFilteredGuests(filtered);
    }
  }, [guestSearchTerm, guests]);
  
  // Update available rooms when dates change
  useEffect(() => {
    if (formData.check_in_date && formData.check_out_date) {
      // Filter rooms that are available (not occupied, maintenance, or cleaning)
      const available = rooms.filter(room => room.status === 'available');
      setAvailableRooms(available);
    } else {
      setAvailableRooms([]);
    }
  }, [formData.check_in_date, formData.check_out_date, rooms]);
  
  // Update total amount when room or dates change
  useEffect(() => {
    if (selectedRoom && formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        const totalAmount = selectedRoom.base_price * nights;
        setFormData(prev => ({
          ...prev,
          total_amount: totalAmount
        }));
      }
    }
  }, [selectedRoom, formData.check_in_date, formData.check_out_date]);
  
  const selectGuest = (guest) => {
    setSelectedGuest(guest);
    setFormData(prev => ({
      ...prev,
      guest_id: guest.guest_id.toString()
    }));
    setGuestSearchTerm('');
  };
  
  const selectRoom = (room) => {
    setSelectedRoom(room);
    setFormData(prev => ({
      ...prev,
      room_id: room.room_id.toString()
    }));
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when field changes
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.guest_id) {
      newErrors.guest_id = 'Please select a guest';
    }
    
    if (!formData.room_id) {
      newErrors.room_id = 'Please select a room';
    }
    
    if (!formData.check_in_date) {
      newErrors.check_in_date = 'Check-in date is required';
    }
    
    if (!formData.check_out_date) {
      newErrors.check_out_date = 'Check-out date is required';
    }
    
    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      
      if (checkOut <= checkIn) {
        newErrors.check_out_date = 'Check-out date must be after check-in date';
      }
    }
    
    if (!formData.number_of_guests || formData.number_of_guests < 1) {
      newErrors.number_of_guests = 'Number of guests must be at least 1';
    }
    
    if (selectedRoom && formData.number_of_guests > selectedRoom.capacity) {
      newErrors.number_of_guests = `Maximum capacity for this room is ${selectedRoom.capacity} guest(s)`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare booking data
      const bookingData = {
        ...formData,
        guest_id: parseInt(formData.guest_id),
        room_id: parseInt(formData.room_id),
        room_number: selectedRoom.room_number,
        room_type: selectedRoom.room_type_name,
        status: 'confirmed',
        guest_name: `${selectedGuest.first_name} ${selectedGuest.last_name}`
      };
      
      // Add booking
      const newBooking = addBooking(bookingData);
      
      // Navigate to booking details
      navigate(`/bookings/${newBooking.booking_id}`, {
        state: { message: 'Booking created successfully!' }
      });
    } catch (err) {
      console.error('Error creating booking:', err);
      setErrors({ submit: 'Failed to create booking. Please try again.' });
      setSubmitting(false);
    }
  };
  
  return (
    <div className="new-booking-container">
      <h1>Create New Booking</h1>
      
      {errors.submit && <div className="error-message">{errors.submit}</div>}
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h2>Guest Information</h2>
          
          {selectedGuest ? (
            <div className="selected-guest">
              <div className="guest-info">
                <div className="guest-name">{selectedGuest.first_name} {selectedGuest.last_name}</div>
                <div className="guest-contact">{selectedGuest.email} | {selectedGuest.phone}</div>
              </div>
              <button 
                type="button" 
                className="change-button"
                onClick={() => {
                  setSelectedGuest(null);
                  setFormData(prev => ({ ...prev, guest_id: '' }));
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <div className="guest-selection">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search guests by name, email, or phone..."
                  value={guestSearchTerm}
                  onChange={(e) => setGuestSearchTerm(e.target.value)}
                  className={errors.guest_id ? 'error' : ''}
                />
              </div>
              
              {errors.guest_id && <div className="error-text">{errors.guest_id}</div>}
              
              <div className="guests-list">
                {filteredGuests.length > 0 ? (
                  filteredGuests.slice(0, 5).map(guest => (
                    <div 
                      key={guest.guest_id} 
                      className="guest-item"
                      onClick={() => selectGuest(guest)}
                    >
                      <div className="guest-name">{guest.first_name} {guest.last_name}</div>
                      <div className="guest-details">
                        <span>{guest.email}</span>
                        <span>{guest.phone}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    {guestSearchTerm ? 
                      `No guests found matching "${guestSearchTerm}"` : 
                      'Start typing to search for guests'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h2>Booking Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="check_in_date">Check-in Date *</label>
              <input
                type="date"
                id="check_in_date"
                name="check_in_date"
                value={formData.check_in_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={errors.check_in_date ? 'error' : ''}
              />
              {errors.check_in_date && <div className="error-text">{errors.check_in_date}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="check_out_date">Check-out Date *</label>
              <input
                type="date"
                id="check_out_date"
                name="check_out_date"
                value={formData.check_out_date}
                onChange={handleChange}
                min={formData.check_in_date || new Date().toISOString().split('T')[0]}
                className={errors.check_out_date ? 'error' : ''}
              />
              {errors.check_out_date && <div className="error-text">{errors.check_out_date}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="number_of_guests">Number of Guests *</label>
              <input
                type="number"
                id="number_of_guests"
                name="number_of_guests"
                value={formData.number_of_guests}
                onChange={handleChange}
                min="1"
                className={errors.number_of_guests ? 'error' : ''}
              />
              {errors.number_of_guests && <div className="error-text">{errors.number_of_guests}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="booking_source">Booking Source</label>
              <select
                id="booking_source"
                name="booking_source"
                value={formData.booking_source}
                onChange={handleChange}
              >
                <option value="direct">Direct</option>
                <option value="website">Website</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="walk_in">Walk-In</option>
                <option value="booking_com">Booking.com</option>
                <option value="expedia">Expedia</option>
                <option value="airbnb">Airbnb</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="special_requests">Special Requests</label>
            <textarea
              id="special_requests"
              name="special_requests"
              value={formData.special_requests}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
        </div>
        
        {/* Room selection section */}
        {formData.check_in_date && formData.check_out_date && (
          <div className="form-section">
            <h2>Room Selection</h2>
            
            {availableRooms.length > 0 ? (
              <>
                {errors.room_id && <div className="error-text">{errors.room_id}</div>}
                
                <div className="room-selection-grid">
                  {availableRooms.map(room => {
                    const isSelected = selectedRoom && selectedRoom.room_id === room.room_id;
                    
                    return (
                      <div 
                        key={room.room_id} 
                        className={`room-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => selectRoom(room)}
                      >
                        <div className="room-header">
                          <h3>Room {room.room_number}</h3>
                          <div className="room-type">{room.room_type_name}</div>
                        </div>
                        <div className="room-details">
                          <div className="detail-item">
                            <span className="label">Capacity:</span>
                            <span className="value">{room.capacity} {room.capacity === 1 ? 'person' : 'people'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Price:</span>
                            <span className="value">${room.base_price}/night</span>
                          </div>
                          <div className="detail-item description">
                            <span className="value">{room.description || 'Standard room'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="no-rooms-message">
                {formData.check_in_date && formData.check_out_date ? 
                  'No rooms available for the selected dates. Please try different dates.' : 
                  'Please select check-in and check-out dates to see available rooms.'}
              </div>
            )}
          </div>
        )}
        
        {/* Price summary */}
        {selectedRoom && formData.check_in_date && formData.check_out_date && (
          <div className="form-section">
            <h2>Price Summary</h2>
            
            <div className="price-summary">
              <div className="summary-row">
                <div className="summary-label">Room Rate:</div>
                <div className="summary-value">${selectedRoom.base_price}/night</div>
              </div>
              
              <div className="summary-row">
                <div className="summary-label">Nights:</div>
                <div className="summary-value">
                  {Math.ceil(
                    (new Date(formData.check_out_date) - new Date(formData.check_in_date)) / 
                    (1000 * 60 * 60 * 24)
                  )}
                </div>
              </div>
              
              <div className="summary-row total">
                <div className="summary-label">Total:</div>
                <div className="summary-value">${formData.total_amount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/bookings')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBooking;