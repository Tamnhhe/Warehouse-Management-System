//Nguyễn Bảo Phi-HE173187-7/2/20252025
const express = require("express");
const inventoryTransactionRouter = express.Router();
const { InventoryTransactionController } = require("../controllers");

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
  InventoryTransactionController.createTransaction
);
inventoryTransactionRouter.post(
  "/create-receipts",
  InventoryTransactionController.createReceipt
);

module.exports = inventoryTransactionRouter;
