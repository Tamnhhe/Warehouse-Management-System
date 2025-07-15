const express = require("express");
const router = express.Router();
const stocktakingController = require("../controllers/stocktaking.controller");

// Tạo phiếu kiểm kê
router.post("/create", stocktakingController.createStocktakingTask);
// Tạo phiếu điều chỉnh
router.post("/adjustment", stocktakingController.createAdjustment);
// Lấy lịch sử kiểm kê
router.get("/history", stocktakingController.getStocktakingHistory);
// Lấy lịch sử điều chỉnh
router.get("/adjustment-history", stocktakingController.getAdjustmentHistory);

module.exports = router;
