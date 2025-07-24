const express = require("express");
const inventoryTransactionRouter = express.Router();
const { InventoryTransactionController } = require("../controllers");
const {
  authenticateJWT,
  roleAuthenticate,
} = require("../middlewares/jwtMiddleware");

inventoryTransactionRouter.get(
  "/getAllTransactions",
  authenticateJWT,
  InventoryTransactionController.getAllTransactions
);
inventoryTransactionRouter.get(
  "/getTransactionById/:id",
  authenticateJWT,
  InventoryTransactionController.getTransactionById
);
inventoryTransactionRouter.put(
  "/updateTransaction/:id",
  authenticateJWT,
  roleAuthenticate(["manager", "employee"]), // ✅ CHO PHÉP CẢ EMPLOYEE VÀ MANAGER RÀ SOÁT
  InventoryTransactionController.updateTransaction
);
inventoryTransactionRouter.put(
  "/updateTransactionStatus/:id",
  authenticateJWT,
  roleAuthenticate(["manager"]), // ✅ CHỈ MANAGER MỚI ĐƯỢC ĐỔI TRẠNG THÁI
  InventoryTransactionController.updateTransactionStatus
);
inventoryTransactionRouter.post(
  "/createTransaction",
  authenticateJWT,
  InventoryTransactionController.createTransaction
);
inventoryTransactionRouter.post(
  "/create-receipts",
  authenticateJWT,
  InventoryTransactionController.createReceipt
);

module.exports = inventoryTransactionRouter;
