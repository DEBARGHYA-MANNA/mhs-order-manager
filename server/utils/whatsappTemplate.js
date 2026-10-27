/**
 * WhatsApp Message Template Builder
 *
 * This file is kept separate so the message format can be easily
 * modified without touching any other code.
 *
 * Available variables:
 * - order: Full order object
 * - shopName: Name of the shop
 *
 * Edit the buildMessage function to change the format.
 */

const buildWhatsAppMessage = (order, shopName = 'MHS Medical Store') => {
    const date = new Date(order.orderedAt || order.draftedAt || new Date());
    const formattedDate = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    // Build items list
    let itemsList = '';
    let totalQty = 0;

    order.items.forEach((item, index) => {
        const size = item.size ? ` — ${item.size}` : '';
        itemsList += `${index + 1}. ${item.medicineName} (${item.company})${size} × ${item.quantity}\n`;
        totalQty += item.quantity;
    });

    // Build the message
    const message = `🛒 *New Order — ${shopName}*
📅 Date: ${formattedDate}
🔢 Order #: ${order.orderNumber}

*To: ${order.contactName}*

${itemsList.trim()}

📦 Total Items: ${order.items.length}
📊 Total Qty: ${totalQty}
${order.notes ? `\n📝 Note: ${order.notes}` : ''}

Please confirm & dispatch. 🙏`;

    return message;
};

/**
 * Build the wa.me URL
 * @param {string} phone - Phone number with country code (e.g. 919876543210)
 * @param {string} message - The message text
 * @returns {string} The complete wa.me URL
 */
const buildWhatsAppURL = (phone, message) => {
    // Remove any non-numeric characters from phone
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

module.exports = {
    buildWhatsAppMessage,
    buildWhatsAppURL,
};