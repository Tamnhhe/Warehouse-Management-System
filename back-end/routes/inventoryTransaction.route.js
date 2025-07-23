const express = require("express");
const inventoryTransactionRouter = express.Router();
const { InventoryTransactionController } = require("../controllers");
const { authenticateJWT } = require("../middlewares/jwtMiddleware");

inventoryTransactionRouter.get(
  "/getAllTransactions",
  InventoryTransactionController.getAllTransactions
);
inventoryTransactionRouter.get(
  "/getTransactionById/:id",
  InventoryTransactionController.getTransactionById
);

inventoryTransactionRouter.put(
  "/updateTransaction/:id",
  InventoryTransactionController.updateTransaction
);
inventoryTransactionRouter.put(
  "/updateTransactionStatus/:id",
  InventoryTransactionController.updateTransactionStatus
);

inventoryTransactionRouter.post(
  "/createTransaction",
  authenticateJWT,
  InventoryTransactionController.createTransaction
);
inventoryTransactionRouter.post(
  "/create-receipts",
  InventoryTransactionController.createReceipt
);

module.exports = inventoryTransactionRouter;
