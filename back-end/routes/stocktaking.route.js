const express = require("express");
const router = express.Router();
const stocktakingController = require("../controllers/stocktaking.controller");

// Tạo phiếu kiểm kê
router.post("/create", stocktakingController.createStocktakingTask);
// Tạo phiếu điều chỉnh
router.post("/adjustment", stocktakingController.createAdjustment);
// Tạo phiếu kiểm kê pending
router.post(
  "/create-pending",
  stocktakingController.createPendingStocktakingTask
);
// Cập nhật phiếu kiểm kê (xác nhận số lượng thực tế)
router.put("/update/:id", stocktakingController.updateStocktakingTask);
// Lấy chi tiết phiếu kiểm kê
router.get("/detail/:id", stocktakingController.getStocktakingTaskDetail);
// Lấy lịch sử kiểm kê
router.get("/history", stocktakingController.getStocktakingHistory);
// Lấy lịch sử điều chỉnh
router.get("/adjustment-history", stocktakingController.getAdjustmentHistory);

module.exports = router;
