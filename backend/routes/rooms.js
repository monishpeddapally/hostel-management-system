const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all rooms
router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT r.*, rt.name as room_type_name, rt.capacity, rt.base_price 
      FROM room r
      JOIN room_type rt ON r.room_type_id = rt.room_type_id
      WHERE r.active = true
      ORDER BY r.room_number
    `);
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available rooms
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT r.*, rt.name as room_type_name, rt.capacity, rt.base_price 
      FROM room r
      JOIN room_type rt ON r.room_type_id = rt.room_type_id
      WHERE r.active = true 
      AND r.room_id NOT IN (
        SELECT ra.room_id 
        FROM room_assignment ra
        JOIN booking b ON ra.booking_id = b.booking_id
        WHERE (
          (b.check_in_date <= ? AND b.check_out_date > ?) OR
          (b.check_in_date < ? AND b.check_out_date >= ?) OR
          (b.check_in_date >= ? AND b.check_out_date <= ?)
        )
        AND b.status NOT IN ('cancelled', 'no-show')
      )
      ORDER BY rt.base_price
    `, [checkOut, checkIn, checkOut, checkIn, checkIn, checkOut]);
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single room
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT r.*, rt.name as room_type_name, rt.capacity, rt.base_price, rt.amenities
      FROM room r
      JOIN room_type rt ON r.room_type_id = rt.room_type_id
      WHERE r.room_id = ?
    `, [id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new room
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      room_number,
      room_type_id,
      status,
      floor,
      description,
      active
    } = req.body;
    
    const connection = await pool.getConnection();
    
    // Check if room number already exists
    const [existingRooms] = await connection.execute(
      'SELECT room_id FROM room WHERE room_number = ?',
      [room_number]
    );
    
    if (existingRooms.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Room number already exists' });
    }
    
    // Create new room
    const [result] = await connection.execute(
      `INSERT INTO room (
        room_number, room_type_id, status, floor, description, active
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        room_number, room_type_id, status || 'available', 
        floor, description, active !== undefined ? active : true
      ]
    );
    connection.release();
    
    res.status(201).json({ 
      message: 'Room created successfully', 
      roomId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update room status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE room SET status = ? WHERE room_id = ?',
      [status, id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({ message: 'Room status updated successfully' });
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a room
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      room_number,
      room_type_id,
      status,
      floor,
      description,
      active
    } = req.body;
    
    const connection = await pool.getConnection();
    
    // Check if room number already exists for another room
    if (room_number) {
      const [existingRooms] = await connection.execute(
        'SELECT room_id FROM room WHERE room_number = ? AND room_id != ?',
        [room_number, id]
      );
      
      if (existingRooms.length > 0) {
        connection.release();
        return res.status(400).json({ message: 'Room number already exists' });
      }
    }
    
    // Update room
    const [result] = await connection.execute(
      `UPDATE room SET 
        room_number = ?, 
        room_type_id = ?, 
        status = ?, 
        floor = ?, 
        description = ?, 
        active = ?
      WHERE room_id = ?`,
      [
        room_number, room_type_id, status, floor, 
        description, active, id
      ]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({ message: 'Room updated successfully' });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room types
router.get('/types/all', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM room_type');
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;