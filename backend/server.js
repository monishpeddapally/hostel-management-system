const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const guestRoutes = require('./routes/guests');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const operationsRoutes = require('./routes/operations');
const paymentRoutes = require('./routes/payments');
const reportRoutes = require('./routes/reports');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Hostel Management System API is running');
});

console.log('Server code loaded, about to listen on port');
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;