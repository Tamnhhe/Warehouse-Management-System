const express = require("express");
const orderRouter = express.Router();
const orderController = require("../controllers/order.controller");

// Tạo đơn hàng (customer phải đăng nhập, gửi token trong header Authorization)
orderRouter.post("/create", orderController.createOrder);

// Lấy đơn hàng của khách hàng hiện tại
orderRouter.get("/my-orders", orderController.getOrdersByCustomer);

module.exports = orderRouter;
