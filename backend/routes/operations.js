const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Check-in route
router.post('/check-in/:bookingId', authenticateToken, async (req, res) => {
  let connection;
  try {
    const { bookingId } = req.params;
    
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Update booking status
    await connection.execute(
      'UPDATE booking SET status = ? WHERE booking_id = ?',
      ['checked-in', bookingId]
    );
    
    // Update room assignment
    await connection.execute(
      'UPDATE room_assignment SET check_in_time = NOW(), status = ? WHERE booking_id = ?',
      ['occupied', bookingId]
    );
    
    // Get room information
    const [roomRows] = await connection.execute(
      'SELECT room_id FROM room_assignment WHERE booking_id = ?',
      [bookingId]
    );
    
    if (roomRows.length > 0) {
      // Update room status
      await connection.execute(
        'UPDATE room SET status = ? WHERE room_id = ?',
        ['occupied', roomRows[0].room_id]
      );
    }
    
    await connection.commit();
    connection.release();
    
    res.json({ message: 'Check-in successful' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Error during check-in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check-out route
router.post('/check-out/:bookingId', authenticateToken, async (req, res) => {
  let connection;
  try {
    const { bookingId } = req.params;
    const { finalAmount, extraCharges } = req.body;
    
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Update booking status and final amount
    await connection.execute(
      'UPDATE booking SET status = ?, total_amount = ? WHERE booking_id = ?',
      ['checked-out', finalAmount, bookingId]
    );
    
    // Update room assignment
    await connection.execute(
      'UPDATE room_assignment SET check_out_time = NOW(), status = ? WHERE booking_id = ?',
      ['vacated', bookingId]
    );
    
    // Get room information
    const [roomRows] = await connection.execute(
      'SELECT room_id FROM room_assignment WHERE booking_id = ?',
      [bookingId]
    );
    
    if (roomRows.length > 0) {
      // Update room status
      await connection.execute(
        'UPDATE room SET status = ? WHERE room_id = ?',
        ['cleaning', roomRows[0].room_id]
      );
    }
    
    // Store extra charges if any
    if (extraCharges && extraCharges.length > 0) {
      for (const charge of extraCharges) {
        await connection.execute(
          `INSERT INTO extra_charge (
            booking_id, description, amount, created_at
          ) VALUES (?, ?, ?, NOW())`,
          [bookingId, charge.description, charge.amount]
        );
      }
    }
    
    await connection.commit();
    connection.release();
    
    res.json({ message: 'Check-out successful' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Error during check-out:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;