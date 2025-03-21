const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all bookings (with filtering options)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, fromDate, toDate, guestId } = req.query;
    
    let query = `
      SELECT b.*, g.first_name, g.last_name, g.email, g.phone,
      s.first_name as staff_first_name, s.last_name as staff_last_name,
      r.room_number, rt.name as room_type
      FROM booking b
      JOIN guest g ON b.guest_id = g.guest_id
      LEFT JOIN staff s ON b.staff_id = s.staff_id
      JOIN room_assignment ra ON b.booking_id = ra.booking_id
      JOIN room r ON ra.room_id = r.room_id
      JOIN room_type rt ON r.room_type_id = rt.room_type_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (status) {
      query += ' AND b.status = ?';
      queryParams.push(status);
    }
    
    if (fromDate && toDate) {
      query += ' AND (b.check_in_date >= ? AND b.check_out_date <= ?)';
      queryParams.push(fromDate, toDate);
    }
    
    if (guestId) {
      query += ' AND b.guest_id = ?';
      queryParams.push(guestId);
    }
    
    query += ' ORDER BY b.booking_date DESC';
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(query, queryParams);
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT b.*, g.first_name, g.last_name, g.email, g.phone, g.nationality,
      s.first_name as staff_first_name, s.last_name as staff_last_name,
      r.room_number, rt.name as room_type, ra.check_in_time, ra.check_out_time
      FROM booking b
      JOIN guest g ON b.guest_id = g.guest_id
      LEFT JOIN staff s ON b.staff_id = s.staff_id
      JOIN room_assignment ra ON b.booking_id = ra.booking_id
      JOIN room r ON ra.room_id = r.room_id
      JOIN room_type rt ON r.room_type_id = rt.room_type_id
      WHERE b.booking_id = ?
    `, [id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new booking
router.post('/', authenticateToken, async (req, res) => {
  let connection;
  try {
    const {
      guest_id,
      check_in_date,
      check_out_date,
      number_of_guests,
      room_id,
      total_amount,
      booking_source,
      special_requests
    } = req.body;
    
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Create booking
    const [bookingResult] = await connection.execute(
      `INSERT INTO booking (
        guest_id, booking_date, check_in_date, check_out_date,
        number_of_guests, status, total_amount, staff_id,
        booking_source, special_requests, created_at, updated_at
      ) VALUES (?, NOW(), ?, ?, ?, 'confirmed', ?, ?, ?, ?, NOW(), NOW())`,
      [
        guest_id, check_in_date, check_out_date, number_of_guests,
        total_amount, req.user.id, booking_source, special_requests
      ]
    );
    
    const bookingId = bookingResult.insertId;
    
    // Create room assignment
    await connection.execute(
      `INSERT INTO room_assignment (
        booking_id, room_id, status
      ) VALUES (?, ?, 'assigned')`,
      [bookingId, room_id]
    );
    
    await connection.commit();
    connection.release();
    
    res.status(201).json({ 
      message: 'Booking created successfully', 
      bookingId 
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE booking SET status = ? WHERE booking_id = ?',
      [status, id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;