const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Logging (dev only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'MHS Order Manager API is running',
        timestamp: new Date().toISOString(),
    });
});

// Error handler (must be after routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════╗
  ║     MHS Order Manager API Server              ║
  ║     Running on port: ${PORT}                     ║
  ║     Environment: ${process.env.NODE_ENV || 'development'}            ║
  ╚═══════════════════════════════════════════════╝
  `);
});