const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authenticateJWT } = require("../middlewares/jwtMiddleware"); // Sử dụng authenticateJWT thay vì verifyToken

// Tạo thông báo mới
router.post("/", authenticateJWT, notificationController.createNotification);

// Lấy danh sách thông báo của user
router.get(
  "/user/:userId",
  authenticateJWT,
  notificationController.getUserNotifications
);

// Lấy số lượng thông báo chưa đọc
router.get(
  "/user/:userId/unread-count",
  authenticateJWT,
  notificationController.getUnreadCount
);

// Đánh dấu thông báo đã đọc
router.put(
  "/:notificationId/read",
  authenticateJWT,
  notificationController.markAsRead
);

// Đánh dấu tất cả thông báo đã đọc
router.put(
  "/user/:userId/read-all",
  authenticateJWT,
  notificationController.markAllAsRead
);

module.exports = router;
