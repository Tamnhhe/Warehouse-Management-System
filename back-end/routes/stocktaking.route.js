const express = require("express");
const router = express.Router();
const stocktakingController = require("../controllers/stocktaking.controller");
const {
  authenticateJWT,
  roleAuthenticate,
} = require("../middlewares/jwtMiddleware");

// Tạo phiếu kiểm kê
router.post(
  "/create",
  authenticateJWT,
  stocktakingController.createStocktakingTask
);
// Tạo phiếu điều chỉnh
router.post(
  "/adjustment",
  roleAuthenticate(["manager"]),
  stocktakingController.createAdjustment
);
// Tạo phiếu kiểm kê pending
router.post(
  "/create-pending",
  authenticateJWT,
  stocktakingController.createPendingStocktakingTask
);
// Cập nhật phiếu kiểm kê (xác nhận số lượng thực tế)
router.put(
  "/update/:id",
  authenticateJWT,
  stocktakingController.updateStocktakingTask
);
// Lấy chi tiết phiếu kiểm kê
router.get(
  "/detail/:id",
  authenticateJWT,
  stocktakingController.getStocktakingTaskDetail
);
// Lấy lịch sử kiểm kê
router.get(
  "/history",
  authenticateJWT,
  stocktakingController.getStocktakingHistory
);
// Lấy lịch sử điều chỉnh
router.get(
  "/adjustment-history",
  authenticateJWT,
  stocktakingController.getAdjustmentHistory
);
// Xóa phiếu kiểm kê (chỉ cho phép xóa phiếu pending)
router.delete(
  "/delete/:id",
  authenticateJWT,
  stocktakingController.deleteStocktakingTask
);

module.exports = router;
