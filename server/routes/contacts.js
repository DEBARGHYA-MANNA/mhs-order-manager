const express = require('express');
const router = express.Router();
const {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
} = require('../controllers/contactController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.route('/').get(getContacts).post(createContact);

router.route('/:id').get(getContact).put(updateContact).delete(adminOnly, deleteContact);

module.exports = router;