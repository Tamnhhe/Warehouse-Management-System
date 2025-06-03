const db = require("../models/index"); // Đảm bảo models/index.js export Order model
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Tạo đơn hàng mới
async function createOrder(req, res) {
  try {
    // Lấy token từ header để xác định customer
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Không tồn tại token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;

    const { products, shippingAddress, paymentMethod, notes } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm không được để trống" });
    }

    // Tính tổng tiền đơn hàng dựa trên danh sách products
    // Giả sử mỗi product object trong mảng: { productId, quantity }
    // Cần lấy giá hiện tại từ DB để tính tổng
    let totalAmount = 0;
    for (const item of products) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ message: "productId không hợp lệ" });
      }
      const product = await db.Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm không tồn tại: ${item.productId}` });
      }
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: "Số lượng sản phẩm phải lớn hơn 0" });
      }
      totalAmount += product.price * item.quantity;
    }

    // Chuẩn bị mảng products lưu vào order với giá cố định thời điểm đặt
    const orderProducts = products.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: 0, // tạm thời set 0, bạn có thể gán giá bên trên
    }));

    // Gán giá chính xác vào từng sản phẩm
    for (let i = 0; i < orderProducts.length; i++) {
      const prod = await db.Product.findById(orderProducts[i].productId);
      orderProducts[i].price = prod.price;
    }

    const newOrder = new db.Order({
      customerId,
      products: orderProducts,
      shippingAddress,
      paymentMethod,
      totalAmount,
      notes,
    });

    await newOrder.save();

    res.status(201).json({ message: "Đặt hàng thành công", order: newOrder });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}

// Lấy danh sách đơn hàng của khách hàng hiện tại
async function getOrdersByCustomer(req, res) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Không tồn tại token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;

    const orders = await db.Order.find({ customerId }).populate("products.productId");

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}

module.exports = {
  createOrder,
  getOrdersByCustomer,
};
