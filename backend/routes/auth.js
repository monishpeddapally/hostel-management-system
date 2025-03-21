const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM staff WHERE username = ? AND active = true',
      [username]
    );
    connection.release();
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const staff = rows[0];
    const validPassword = await bcrypt.compare(password, staff.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: staff.staff_id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({
      token,
      user: {
        id: staff.staff_id,
        firstName: staff.first_name,
        lastName: staff.last_name,
        role: staff.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;