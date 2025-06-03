const db = require("../models/index");
const mongoose = require("mongoose");

// Tạo đơn hàng mới
async function createOrder(req, res) {
  try {
    const customerId = req.user.id; // lấy từ middleware xác thực
    const { products, shippingAddress, paymentMethod, notes } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm không được để trống" });
    }

    // Tính tổng tiền đơn hàng dựa trên giá sản phẩm thực tế trong DB
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

    const orderProducts = products.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: 0, // sẽ gán giá chính xác ngay sau
    }));

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
    const customerId = req.user.id;
    const orders = await db.Order.find({ customerId }).populate("products.productId");
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}

// Hủy đơn hàng (chỉ cho phép hủy đơn trạng thái pending hoặc confirmed)
async function cancelOrder(req, res) {
  try {
    const customerId = req.user.id;
    const orderId = req.params.id;

    const order = await db.Order.findOne({ _id: orderId, customerId });
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({ message: "Không thể hủy đơn hàng đã được xử lý" });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({ message: "Hủy đơn hàng thành công", order });
  } catch (error) {
    console.error("Lỗi hủy đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}

// Cập nhật thông tin cá nhân customer
async function editProfile(req, res) {
  try {
    const customerId = req.user.id;
    const { fullName, phoneNumber, dob, address, gender, idCard } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : req.body.avatar;

    const updateData = {
      fullName,
      "profile.phoneNumber": phoneNumber,
      "profile.dob": dob,
      "profile.address": address,
      "profile.gender": gender,
      "profile.idCard": idCard,
    };

    if (avatar) updateData["profile.avatar"] = avatar;

    const updatedCustomer = await db.Customer.findByIdAndUpdate(customerId, { $set: updateData }, { new: true });
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    res.status(200).json({ message: "Cập nhật thông tin thành công", customer: updatedCustomer });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}

module.exports = {
  createOrder,
  getOrdersByCustomer,
  cancelOrder,
  editProfile,
};
