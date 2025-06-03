// Nguyễn Đức Linh - HE170256 17/1/2025
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['inventoryEntry', 'lowStock', 'productUpdate', 'transactionRequest'],
    },
    recipient: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        ref: 'User', // Liên kết đến collection User
    },
    message: {
        type: String,
        required: true, // Nội dung thông báo
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    relatedData: {// Thông tin liên quan như sản phẩm, đơn hàng, hoặc nhập kho
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        type: { // Loại dữ liệu liên quan, ví dụ: "Product", "Order", "WarehouseEntry"
            type: String,
            required: false,
        },
    },
    isSeen: { // xem thông báo chưa
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Notification', NotificationSchema);
