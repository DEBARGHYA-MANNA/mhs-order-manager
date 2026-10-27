/**
 * WhatsApp utility for frontend
 * Opens WhatsApp with pre-filled message
 */

export const openWhatsApp = (whatsappURL) => {
    if (typeof window !== 'undefined') {
        window.open(whatsappURL, '_blank');
    }
};

/**
 * Build WhatsApp URL on frontend (backup if API doesn't provide it)
 */
export const buildWhatsAppLink = (phone, message) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};