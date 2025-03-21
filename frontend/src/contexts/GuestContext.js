import React, { createContext, useState, useEffect } from 'react';

// Create context
export const GuestContext = createContext();

// Initial mock data
const initialGuests = [
  { guest_id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', phone: '123-456-7890', nationality: 'USA', id_proof_type: 'passport' },
  { guest_id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', phone: '098-765-4321', nationality: 'Canada', id_proof_type: 'drivers_license' },
  { guest_id: 3, first_name: 'Michael', last_name: 'Johnson', email: 'michael.j@example.com', phone: '555-123-4567', nationality: 'UK', id_proof_type: 'passport' },
  { guest_id: 4, first_name: 'Emily', last_name: 'Williams', email: 'emily.w@example.com', phone: '555-987-6543', nationality: 'Australia', id_proof_type: 'national_id' },
  { guest_id: 5, first_name: 'David', last_name: 'Brown', email: 'david.b@example.com', phone: '555-567-8901', nationality: 'Germany', id_proof_type: 'passport' },
  { guest_id: 6, first_name: 'Sarah', last_name: 'Miller', email: 'sarah.m@example.com', phone: '555-234-5678', nationality: 'France', id_proof_type: 'national_id' },
  { guest_id: 7, first_name: 'Robert', last_name: 'Wilson', email: 'robert.w@example.com', phone: '555-876-5432', nationality: 'Spain', id_proof_type: 'passport' },
  { guest_id: 8, first_name: 'Jennifer', last_name: 'Taylor', email: 'jennifer.t@example.com', phone: '555-345-6789', nationality: 'Italy', id_proof_type: 'drivers_license' },
  { guest_id: 9, first_name: 'Thomas', last_name: 'Anderson', email: 'thomas.a@example.com', phone: '555-654-3210', nationality: 'Netherlands', id_proof_type: 'passport' },
  { guest_id: 10, first_name: 'Lisa', last_name: 'Martinez', email: 'lisa.m@example.com', phone: '555-789-0123', nationality: 'Mexico', id_proof_type: 'national_id' },
  { guest_id: 11, first_name: 'Daniel', last_name: 'Garcia', email: 'daniel.g@example.com', phone: '555-321-0987', nationality: 'Brazil', id_proof_type: 'passport' },
  { guest_id: 12, first_name: 'Karen', last_name: 'Rodriguez', email: 'karen.r@example.com', phone: '555-456-7890', nationality: 'Argentina', id_proof_type: 'drivers_license' }
];

// Provider component
export const GuestProvider = ({ children }) => {
  const [guests, setGuests] = useState(() => {
    // Try to get guests from localStorage first
    const savedGuests = localStorage.getItem('guests');
    return savedGuests ? JSON.parse(savedGuests) : initialGuests;
  });
  
  // Save guests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('guests', JSON.stringify(guests));
  }, [guests]);
  
  // Add a new guest
  const addGuest = (guest) => {
    const newGuest = {
      ...guest,
      guest_id: guests.length > 0 ? Math.max(...guests.map(g => g.guest_id)) + 1 : 1
    };
    setGuests([...guests, newGuest]);
    return newGuest;
  };
  
  // Get a single guest by ID
  const getGuest = (id) => {
    return guests.find(guest => guest.guest_id === parseInt(id));
  };
  
  // Update a guest
  const updateGuest = (id, updatedGuest) => {
    setGuests(guests.map(guest => 
      guest.guest_id === parseInt(id) ? { ...guest, ...updatedGuest } : guest
    ));
  };
  
  // Delete a guest
  const deleteGuest = (id) => {
    setGuests(guests.filter(guest => guest.guest_id !== parseInt(id)));
  };
  
  return (
    <GuestContext.Provider value={{ 
      guests, 
      addGuest, 
      getGuest, 
      updateGuest, 
      deleteGuest 
    }}>
      {children}
    </GuestContext.Provider>
  );
};