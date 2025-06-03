const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",    // Tham chiếu sang collection Customer riêng biệt
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",  // Tham chiếu tới sản phẩm trong kho
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,   // Giá tại thời điểm đặt hàng, tránh thay đổi giá sau
        required: true,
        min: 0,
      },
    },
  ],
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "completed", "cancelled"],
    default: "pending",
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String },
    postalCode: { type: String },
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "credit_card", "bank_transfer", "paypal"],
    default: "cash",
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
  },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
