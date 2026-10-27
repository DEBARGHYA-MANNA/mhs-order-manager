const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    logout,
    getUsers,
    updateUser,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.post('/login', login);

// First user registration (no auth needed) handled inside controller
router.post('/register', async (req, res, next) => {
    const User = require('../models/User');
    const count = await User.countDocuments();
    if (count === 0) {
        // First user, no auth needed
        return register(req, res, next);
    }
    // Otherwise, need admin auth
    protect(req, res, () => adminOnly(req, res, () => register(req, res, next)));
});

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Admin routes
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id', protect, adminOnly, updateUser);

module.exports = router;