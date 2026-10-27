const express = require('express');
const router = express.Router();
const {
    getSummary,
    getOrdersByContact,
    getSpendingTrend,
    getTopMedicines,
    getStatusBreakdown,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/summary', getSummary);
router.get('/orders-by-contact', getOrdersByContact);
router.get('/spending-trend', getSpendingTrend);
router.get('/top-medicines', getTopMedicines);
router.get('/status-breakdown', getStatusBreakdown);

module.exports = router;