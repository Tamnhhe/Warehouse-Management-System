const express = require("express");
const inventoryRouter = express.Router();
const InventoryController = require("../controllers/inventory.controller");

inventoryRouter.get("/", InventoryController.getAllInventories);
inventoryRouter.post("/add", InventoryController.createInventory);
inventoryRouter.post("/add-product", InventoryController.addProductToShelf);
inventoryRouter.post(
  "/remove-product",
  InventoryController.removeProductFromShelf
);

// Nhập hàng tự động phân bổ vào nhiều kệ
inventoryRouter.post(
  "/import-auto",
  InventoryController.importProductAutoDistribute
);
inventoryRouter.delete("/delete/:id", InventoryController.deleteInventory);
inventoryRouter.get("/layout", InventoryController.getInventoryLayout);
module.exports = inventoryRouter;
