const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Record a payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      booking_id,
      amount,
      payment_method,
      transaction_id,
      notes
    } = req.body;
    
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `INSERT INTO payment (
        booking_id, amount, payment_date, payment_method,
        transaction_id, status, notes
      ) VALUES (?, ?, NOW(), ?, ?, 'completed', ?)`,
      [booking_id, amount, payment_method, transaction_id, notes]
    );
    connection.release();
    
    res.status(201).json({ 
      message: 'Payment recorded successfully', 
      paymentId: result.insertId 
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payments for a booking
router.get('/booking/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM payment WHERE booking_id = ? ORDER BY payment_date DESC',
      [bookingId]
    );
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;