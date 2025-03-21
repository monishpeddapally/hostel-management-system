import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GuestContext } from '../../contexts/GuestContext';
import '../../styles/GuestList.css';

const GuestList = () => {
  const location = useLocation();
  const { guests } = useContext(GuestContext);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [guestsPerPage] = useState(10);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    // Set loading to false since we're using context data
    setLoading(false);
  }, []);

  // Filter guests based on search term
  useEffect(() => {
    const results = guests.filter(guest => {
      const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
      const email = guest.email.toLowerCase();
      const phone = guest.phone.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || email.includes(search) || phone.includes(search);
    });
    
    setFilteredGuests(results);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, guests]);

  // Get current guests for pagination
  const indexOfLastGuest = currentPage * guestsPerPage;
  const indexOfFirstGuest = indexOfLastGuest - guestsPerPage;
  const currentGuests = filteredGuests.slice(indexOfFirstGuest, indexOfLastGuest);
  const totalPages = Math.ceil(filteredGuests.length / guestsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="loading">Loading guests...</div>;
  }

  return (
    <div className="guest-list-container">
      {message && (
        <div className="success-message">
          {message}
        </div>
      )}
      
      <div className="guest-list-header">
        <h1>Guest Directory</h1>
        <Link to="/guests/new" className="add-button">Add New Guest</Link>
      </div>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="clear-search"
            onClick={() => setSearchTerm('')}
          >
            ×
          </button>
        )}
      </div>
      
      {currentGuests.length === 0 ? (
        <div className="no-results">
          No guests found matching "{searchTerm}"
        </div>
      ) : (
        <>
          <div className="guest-count">
            Showing {indexOfFirstGuest + 1}-{Math.min(indexOfLastGuest, filteredGuests.length)} of {filteredGuests.length} guests
          </div>
          
          <table className="guest-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Nationality</th>
                <th>ID Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentGuests.map(guest => (
                <tr key={guest.guest_id}>
                  <td>{guest.first_name} {guest.last_name}</td>
                  <td>{guest.email}</td>
                  <td>{guest.phone}</td>
                  <td>{guest.nationality}</td>
                  <td>
                    <span className="id-badge">
                      {guest.id_proof_type === 'passport' ? 'Passport' : 
                       guest.id_proof_type === 'drivers_license' ? 'Driver\'s License' :
                       guest.id_proof_type === 'national_id' ? 'National ID' : 
                       guest.id_proof_type}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/guests/${guest.guest_id}`} className="view-button">View</Link>
                      <Link to={`/bookings/new?guestId=${guest.guest_id}`} className="book-button">New Booking</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-button"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(num => {
                  // Show first page, last page, current page, and pages around current page
                  return num === 1 || num === totalPages || 
                         (num >= currentPage - 1 && num <= currentPage + 1);
                })
                .map((number, index, array) => {
                  // Add ellipsis if there are gaps in the sequence
                  if (index > 0 && array[index - 1] !== number - 1) {
                    return (
                      <React.Fragment key={`ellipsis-${number}`}>
                        <span className="ellipsis">...</span>
                        <button
                          onClick={() => paginate(number)}
                          className={`page-button ${currentPage === number ? 'active' : ''}`}
                        >
                          {number}
                        </button>
                      </React.Fragment>
                    );
                  }
                  return (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`page-button ${currentPage === number ? 'active' : ''}`}
                    >
                      {number}
                    </button>
                  );
                })}
              
              <button 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GuestList;