const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '24h',
    });
};

// @desc    Register a new user (Admin only, or first user becomes admin)
// @route   POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { name, username, password, role, shopName } = req.body;

        // Check if this is the first user (auto-admin)
        const userCount = await User.countDocuments();
        const assignedRole = userCount === 0 ? 'admin' : role || 'staff';

        // If not first user, only admin can register new users
        if (userCount > 0) {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Only admins can register new users.',
                });
            }
        }

        const user = await User.create({
            name,
            username,
            password,
            role: assignedRole,
            shopName: shopName || 'MHS Medical Store',
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                shopName: user.shopName,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username and password.',
            });
        }

        // Find user and include password field
        const user = await User.findOne({ username: username.toLowerCase() }).select(
            '+password'
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.',
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Contact admin.',
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.',
            });
        }

        const token = generateToken(user._id);

        // Set cookie as well
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'strict',
        });

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                shopName: user.shopName,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = async (req, res, next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 5 * 1000), // 5 seconds
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user (Admin only)
// @route   PUT /api/auth/users/:id
const updateUser = async (req, res, next) => {
    try {
        const { name, role, isActive, shopName } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, role, isActive, shopName },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    logout,
    getUsers,
    updateUser,
};