const express = require("express");
const customerRouter = express.Router();
const { CustomerController } = require("../controllers");
const authenticateToken = require("../middlewares/authMiddleware");
const multer = require("multer");

// Cấu hình multer để upload avatar (nếu có)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Đăng ký customer (không cần token)
customerRouter.post("/register", CustomerController.registerCustomer);

// Đăng nhập customer (không cần token)
customerRouter.post("/login", CustomerController.loginCustomer);

// Lấy thông tin profile (cần token)
customerRouter.get("/profile", authenticateToken, CustomerController.getProfile);

// Cập nhật profile (cần token, có upload avatar)
customerRouter.put(
  "/profile",
  authenticateToken,
  upload.single("avatar"),
  CustomerController.editProfile
);

module.exports = customerRouter;
