const express = require("express");
const orderRouter = express.Router();
const orderController = require("../controllers/order.controller");
const authenticateToken = require("../middlewares/authMiddleware");
const multer = require("multer");

// Cấu hình multer (nếu cần upload avatar khi chỉnh sửa profile)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Tất cả route đều cần xác thực token khách hàng
orderRouter.post("/create", authenticateToken, orderController.createOrder);
orderRouter.get("/my-orders", authenticateToken, orderController.getOrdersByCustomer);
orderRouter.put("/cancel/:id", authenticateToken, orderController.cancelOrder);

// Cập nhật profile khách hàng (upload avatar)
orderRouter.put("/profile", authenticateToken, upload.single("avatar"), orderController.editProfile);

module.exports = orderRouter;
