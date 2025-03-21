import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { RoomContext } from '../../contexts/RoomContext';
import '../../styles/RoomList.css';

const RoomList = () => {
  const { rooms, updateRoomStatus } = useContext(RoomContext);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get unique room types for filter dropdown
  const roomTypes = [...new Set(rooms.map(room => room.room_type_name))];
  
  // Filter rooms when filter, roomTypeFilter, or searchTerm changes
  useEffect(() => {
    let results = [...rooms];
    
    // Filter by status
    if (filter !== 'all') {
      results = results.filter(room => room.status === filter);
    }
    
    // Filter by room type
    if (roomTypeFilter !== 'all') {
      results = results.filter(room => room.room_type_name === roomTypeFilter);
    }
    
    // Filter by search term (room number or description)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      results = results.filter(room => 
        room.room_number.toLowerCase().includes(search) || 
        (room.description && room.description.toLowerCase().includes(search))
      );
    }
    
    setFilteredRooms(results);
    setLoading(false);
  }, [rooms, filter, roomTypeFilter, searchTerm]);
  
  // Handle room status change
  const handleStatusChange = (roomId, newStatus) => {
    updateRoomStatus(roomId, newStatus);
  };
  
  if (loading) {
    return <div className="loading">Loading rooms...</div>;
  }
  
  // Calculate room statistics
  const stats = {
    total: rooms.length,
    available: rooms.filter(room => room.status === 'available').length,
    occupied: rooms.filter(room => room.status === 'occupied').length,
    maintenance: rooms.filter(room => room.status === 'maintenance').length,
    cleaning: rooms.filter(room => room.status === 'cleaning').length
  };
  
  return (
    <div className="room-list-container">
      <div className="room-list-header">
        <h1>Room Management</h1>
      </div>
      
      <div className="room-stats">
        <div className="stat-item">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Rooms</div>
        </div>
        <div className="stat-item available">
          <div className="stat-value">{stats.available}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-item occupied">
          <div className="stat-value">{stats.occupied}</div>
          <div className="stat-label">Occupied</div>
        </div>
        <div className="stat-item maintenance">
          <div className="stat-value">{stats.maintenance}</div>
          <div className="stat-label">Maintenance</div>
        </div>
        <div className="stat-item cleaning">
          <div className="stat-value">{stats.cleaning}</div>
          <div className="stat-label">Cleaning</div>
        </div>
      </div>
      
      <div className="room-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search room number or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-options">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="cleaning">Cleaning</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Room Type:</label>
            <select 
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {filteredRooms.length === 0 ? (
        <div className="no-rooms">
          No rooms match your filters. Try adjusting your search criteria.
        </div>
      ) : (
        <div className="room-grid">
          {filteredRooms.map(room => (
            <div key={room.room_id} className={`room-card ${room.status}`}>
              <div className="room-number">{room.room_number}</div>
              <div className="room-status">{room.status}</div>
              <div className="room-info">
                <div className="room-type">{room.room_type_name}</div>
                <div className="room-price">${room.base_price}/night</div>
                <div className="room-capacity">{room.capacity} {room.capacity === 1 ? 'person' : 'people'}</div>
                <div className="room-description">{room.description}</div>
              </div>
              <div className="room-actions">
                <button
                  onClick={() => handleStatusChange(room.room_id, 'available')}
                  disabled={room.status === 'available'}
                  className="status-button available"
                >
                  Available
                </button>
                <button
                  onClick={() => handleStatusChange(room.room_id, 'maintenance')}
                  disabled={room.status === 'maintenance'}
                  className="status-button maintenance"
                >
                  Maintenance
                </button>
                <button
                  onClick={() => handleStatusChange(room.room_id, 'cleaning')}
                  disabled={room.status === 'cleaning'}
                  className="status-button cleaning"
                >
                  Cleaning
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;