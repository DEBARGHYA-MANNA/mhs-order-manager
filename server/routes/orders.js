const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    sendOrder,
    confirmArrival,
    reorder,
    deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.route('/').get(getOrders).post(createOrder);

router.route('/:id').get(getOrder).put(updateOrder).delete(deleteOrder);

router.put('/:id/send', sendOrder);
router.put('/:id/arrive', confirmArrival);
router.post('/:id/reorder', reorder);

module.exports = router;