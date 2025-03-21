import React, { createContext, useState, useEffect } from 'react';

// Create context
export const RoomContext = createContext();

// Initial mock data
const initialRooms = [
  { room_id: 1, room_number: '101', room_type_id: 1, room_type_name: 'Single', capacity: 1, base_price: 50, status: 'available', floor: '1', description: 'Cozy single room with garden view' },
  { room_id: 2, room_number: '102', room_type_id: 2, room_type_name: 'Double', capacity: 2, base_price: 75, status: 'occupied', floor: '1', description: 'Spacious double room with city view' },
  { room_id: 3, room_number: '103', room_type_id: 3, room_type_name: 'Twin', capacity: 2, base_price: 80, status: 'available', floor: '1', description: 'Twin room with two single beds' },
  { room_id: 4, room_number: '201', room_type_id: 4, room_type_name: 'Triple', capacity: 3, base_price: 100, status: 'maintenance', floor: '2', description: 'Triple room with mountain view' },
  { room_id: 5, room_number: '202', room_type_id: 5, room_type_name: 'Dormitory', capacity: 6, base_price: 30, status: 'available', floor: '2', description: '6-bed dormitory with shared facilities' },
  { room_id: 6, room_number: '203', room_type_id: 2, room_type_name: 'Double', capacity: 2, base_price: 80, status: 'cleaning', floor: '2', description: 'Double room with private bathroom' },
  { room_id: 7, room_number: '301', room_type_id: 2, room_type_name: 'Double', capacity: 2, base_price: 85, status: 'available', floor: '3', description: 'Double room with balcony' },
  { room_id: 8, room_number: '302', room_type_id: 1, room_type_name: 'Single', capacity: 1, base_price: 55, status: 'available', floor: '3', description: 'Single room with work desk' },
  { room_id: 9, room_number: '303', room_type_id: 3, room_type_name: 'Twin', capacity: 2, base_price: 85, status: 'occupied', floor: '3', description: 'Twin room with private bathroom' },
  { room_id: 10, room_number: '401', room_type_id: 4, room_type_name: 'Triple', capacity: 3, base_price: 110, status: 'available', floor: '4', description: 'Deluxe triple room with city view' }
];

// Room types data
const initialRoomTypes = [
  { room_type_id: 1, name: 'Single', description: 'A cozy room with a single bed', capacity: 1, base_price: 50, amenities: 'Wi-Fi, TV, Desk' },
  { room_type_id: 2, name: 'Double', description: 'A comfortable room with a double bed', capacity: 2, base_price: 75, amenities: 'Wi-Fi, TV, Desk, Mini fridge' },
  { room_type_id: 3, name: 'Twin', description: 'A room with two single beds', capacity: 2, base_price: 80, amenities: 'Wi-Fi, TV, Desk, Wardrobe' },
  { room_type_id: 4, name: 'Triple', description: 'A spacious room with three single beds', capacity: 3, base_price: 100, amenities: 'Wi-Fi, TV, Desk, Wardrobe, Sofa' },
  { room_type_id: 5, name: 'Dormitory', description: 'A shared room with multiple beds', capacity: 6, base_price: 30, amenities: 'Wi-Fi, Shared bathroom, Lockers' }
];

// Provider component
export const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState(() => {
    // Try to get rooms from localStorage first
    const savedRooms = localStorage.getItem('rooms');
    return savedRooms ? JSON.parse(savedRooms) : initialRooms;
  });
  
  const [roomTypes, setRoomTypes] = useState(() => {
    // Try to get room types from localStorage first
    const savedRoomTypes = localStorage.getItem('roomTypes');
    return savedRoomTypes ? JSON.parse(savedRoomTypes) : initialRoomTypes;
  });
  
  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  }, [rooms]);
  
  useEffect(() => {
    localStorage.setItem('roomTypes', JSON.stringify(roomTypes));
  }, [roomTypes]);
  
  // Get a single room by ID
  const getRoom = (id) => {
    return rooms.find(room => room.room_id === parseInt(id));
  };
  
  // Get a single room type by ID
  const getRoomType = (id) => {
    return roomTypes.find(type => type.room_type_id === parseInt(id));
  };
  
  // Update room status
  const updateRoomStatus = (id, status) => {
    setRooms(rooms.map(room => 
      room.room_id === parseInt(id) ? { ...room, status } : room
    ));
  };
  
  // Get available rooms for a date range
  const getAvailableRooms = (checkIn, checkOut) => {
    // In a real app, this would check bookings against date ranges
    // For our demo, we'll just filter out rooms that aren't 'available'
    return rooms.filter(room => room.status === 'available');
  };
  
  return (
    <RoomContext.Provider value={{ 
      rooms, 
      roomTypes,
      getRoom,
      getRoomType,
      updateRoomStatus,
      getAvailableRooms
    }}>
      {children}
    </RoomContext.Provider>
  );
};