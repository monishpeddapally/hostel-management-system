const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Occupancy report
router.get('/occupancy', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        DATE(b.check_in_date) as date,
        COUNT(DISTINCT ra.room_id) as occupied_rooms,
        (SELECT COUNT(*) FROM room WHERE active = true) as total_rooms
      FROM booking b
      JOIN room_assignment ra ON b.booking_id = ra.booking_id
      WHERE b.check_in_date <= ? AND b.check_out_date >= ?
      AND b.status NOT IN ('cancelled', 'no-show')
      GROUP BY DATE(b.check_in_date)
      ORDER BY date
    `, [endDate, startDate]);
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error generating occupancy report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Revenue report
router.get('/revenue', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    let groupExpression, selectExpression;
    
    switch (groupBy) {
      case 'daily':
        groupExpression = 'DATE(payment_date)';
        selectExpression = 'DATE(payment_date) as period';
        break;
      case 'weekly':
        groupExpression = 'YEARWEEK(payment_date)';
        selectExpression = 'CONCAT(YEAR(payment_date), "-W", WEEK(payment_date)) as period';
        break;
      case 'monthly':
      default:
        groupExpression = 'YEAR(payment_date), MONTH(payment_date)';
        selectExpression = 'DATE_FORMAT(payment_date, "%Y-%m") as period';
        break;
    }
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        ${selectExpression},
        SUM(amount) as total_revenue,
        COUNT(*) as payment_count
      FROM payment
      WHERE payment_date BETWEEN ? AND ?
      AND status = 'completed'
      GROUP BY ${groupExpression}
      ORDER BY period
    `, [startDate, endDate]);
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Booking sources report
router.get('/booking-sources', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        booking_source as source,
        COUNT(*) as count
      FROM booking
      WHERE booking_date BETWEEN ? AND ?
      GROUP BY booking_source
      ORDER BY count DESC
    `, [startDate, endDate]);
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error generating booking sources report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Room types report
router.get('/room-types', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        rt.name as room_type,
        COUNT(b.booking_id) as bookings_count,
        SUM(b.total_amount) as total_revenue
      FROM booking b
      JOIN room_assignment ra ON b.booking_id = ra.booking_id
      JOIN room r ON ra.room_id = r.room_id
      JOIN room_type rt ON r.room_type_id = rt.room_type_id
      WHERE b.booking_date BETWEEN ? AND ?
      AND b.status NOT IN ('cancelled', 'no-show')
      GROUP BY rt.room_type_id
      ORDER BY bookings_count DESC
    `, [startDate, endDate]);
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error generating room types report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;