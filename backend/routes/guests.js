const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all guests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM guest ORDER BY created_at DESC');
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single guest by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM guest WHERE guest_id = ?', [id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching guest:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new guest
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      id_proof_type,
      id_proof_number,
      date_of_birth,
      nationality
    } = req.body;
    
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `INSERT INTO guest (
        first_name, last_name, email, phone, address, 
        id_proof_type, id_proof_number, date_of_birth, 
        nationality, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        first_name, last_name, email, phone, address,
        id_proof_type, id_proof_number, date_of_birth,
        nationality
      ]
    );
    connection.release();
    
    res.status(201).json({ 
      message: 'Guest created successfully', 
      guestId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating guest:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a guest
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      id_proof_type,
      id_proof_number,
      date_of_birth,
      nationality
    } = req.body;
    
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `UPDATE guest SET 
        first_name = ?, 
        last_name = ?, 
        email = ?, 
        phone = ?, 
        address = ?, 
        id_proof_type = ?, 
        id_proof_number = ?, 
        date_of_birth = ?, 
        nationality = ?,
        updated_at = NOW()
      WHERE guest_id = ?`,
      [
        first_name, last_name, email, phone, address,
        id_proof_type, id_proof_number, date_of_birth,
        nationality, id
      ]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    
    res.json({ message: 'Guest updated successfully' });
  } catch (error) {
    console.error('Error updating guest:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a guest
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    
    // Check if guest has bookings
    const [bookings] = await connection.execute(
      'SELECT booking_id FROM booking WHERE guest_id = ? LIMIT 1',
      [id]
    );
    
    if (bookings.length > 0) {
      connection.release();
      return res.status(400).json({ 
        message: 'Cannot delete guest with existing bookings' 
      });
    }
    
    // Delete guest if no bookings exist
    const [result] = await connection.execute(
      'DELETE FROM guest WHERE guest_id = ?',
      [id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    
    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;