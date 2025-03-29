// File: src/contexts/BookingContext.js
import React, { createContext, useState, useEffect } from 'react';
// Remove the RoomContext import to avoid circular dependency

// Create context
export const BookingContext = createContext();

// Initial mock data
const initialBookings = [
  {
    booking_id: 1,
    guest_id: 1,
    room_id: 2,
    room_number: '102',
    room_type: 'Double',
    check_in_date: '2025-03-20',
    check_out_date: '2025-03-25',
    check_in_time: '2025-03-20T14:30:00',
    check_out_time: null,
    number_of_guests: 2,
    status: 'checked-in',
    total_amount: 375,
    booking_date: '2025-03-10',
    booking_source: 'direct',
    special_requests: 'Extra pillows please.',
    guest_name: 'John Doe'
  },
  {
    booking_id: 2,
    guest_id: 3,
    room_id: 9,
    room_number: '303',
    room_type: 'Twin',
    check_in_date: '2025-03-18',
    check_out_date: '2025-03-22',
    check_in_time: '2025-03-18T15:00:00',
    check_out_time: null,
    number_of_guests: 2,
    status: 'checked-in',
    total_amount: 340,
    booking_date: '2025-03-05',
    booking_source: 'website',
    special_requests: '',
    guest_name: 'Michael Johnson'
  },
  {
    booking_id: 3,
    guest_id: 5,
    room_id: 4,
    room_number: '201',
    room_type: 'Triple',
    check_in_date: '2025-03-15',
    check_out_date: '2025-03-18',
    check_in_time: '2025-03-15T12:00:00',
    check_out_time: '2025-03-18T11:00:00',
    number_of_guests: 3,
    status: 'checked-out',
    total_amount: 300,
    booking_date: '2025-03-01',
    booking_source: 'direct',
    special_requests: 'Late check-out if possible.',
    guest_name: 'David Brown'
  },
  {
    booking_id: 4,
    guest_id: 7,
    room_id: 6,
    room_number: '203',
    room_type: 'Double',
    check_in_date: '2025-03-22',
    check_out_date: '2025-03-29',
    check_in_time: null,
    check_out_time: null,
    number_of_guests: 2,
    status: 'confirmed',
    total_amount: 560,
    booking_date: '2025-03-10',
    booking_source: 'phone',
    special_requests: 'Room with a view.',
    guest_name: 'Robert Wilson'
  }
];

// Provider component
export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState(() => {
    // Try to get bookings from localStorage first
    const savedBookings = localStorage.getItem('bookings');
    return savedBookings ? JSON.parse(savedBookings) : initialBookings;
  });
  
  // Save bookings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);
  
  // Add a new booking
  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      booking_id: bookings.length > 0 ? Math.max(...bookings.map(b => b.booking_id)) + 1 : 1,
      booking_date: new Date().toISOString().split('T')[0]
    };
    setBookings([...bookings, newBooking]);
    
    // Instead of directly calling updateRoomStatus from RoomContext,
    // we'll rely on the component that uses this function to also update the room status
    
    return newBooking;
  };
  
  // Get a single booking by ID
  const getBooking = (id) => {
    return bookings.find(booking => booking.booking_id === parseInt(id));
  };
  
  // Get bookings for a specific guest
  const getGuestBookings = (guestId) => {
    return bookings.filter(booking => booking.guest_id === parseInt(guestId));
  };
  
  // Update booking status
  const updateBookingStatus = (id, status, checkInTime = null, checkOutTime = null) => {
    const updatedBookings = bookings.map(booking => {
      if (booking.booking_id === parseInt(id)) {
        const updatedBooking = { 
          ...booking, 
          status
        };
        
        if (checkInTime) {
          updatedBooking.check_in_time = checkInTime;
        }
        
        if (checkOutTime) {
          updatedBooking.check_out_time = checkOutTime;
        }
        
        return updatedBooking;
      }
      return booking;
    });
    
    setBookings(updatedBookings);
  };
  
  // Handle room status change from room management
  const handleRoomStatusChange = (roomId, newStatus) => {
    // Find active booking for this room
    const activeBooking = bookings.find(booking => 
      booking.room_id === roomId && 
      (booking.status === 'checked-in' || booking.status === 'confirmed')
    );
    
    // If room is being marked as available and there's an active booking, update the booking status
    if (newStatus === 'available' && activeBooking) {
      const now = new Date().toISOString();
      updateBookingStatus(activeBooking.booking_id, 'checked-out', null, now);
    }
  };
  
  // Get today's check-ins
  const getTodayCheckIns = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.check_in_date === today && 
      (booking.status === 'confirmed' || booking.status === 'checked-in')
    );
  };
  
  // Get today's check-outs
  const getTodayCheckOuts = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.check_out_date === today && 
      (booking.status === 'checked-in' || booking.status === 'checked-out')
    );
  };
  
  // Get booking statistics
  const getBookingStats = () => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalBookings: bookings.length,
      activeBookings: bookings.filter(b => b.status === 'checked-in').length,
      upcomingBookings: bookings.filter(b => 
        b.status === 'confirmed' && new Date(b.check_in_date) > new Date()
      ).length,
      todayCheckIns: bookings.filter(b => b.check_in_date === today).length,
      todayCheckOuts: bookings.filter(b => b.check_out_date === today).length
    };
  };
  
  // Make handleRoomStatusChange available globally
  useEffect(() => {
    window.handleRoomStatusChange = handleRoomStatusChange;
    
    return () => {
      delete window.handleRoomStatusChange;
    };
  }, []);
  
  return (
    <BookingContext.Provider value={{ 
      bookings, 
      addBooking, 
      getBooking, 
      getGuestBookings,
      updateBookingStatus,
      handleRoomStatusChange,
      getTodayCheckIns,
      getTodayCheckOuts,
      getBookingStats
    }}>
      {children}
    </BookingContext.Provider>
  );
};