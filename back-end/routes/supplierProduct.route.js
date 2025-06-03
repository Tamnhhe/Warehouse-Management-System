const express = require("express");
const supplierProductRouter = express.Router();
const supplierProductController = require("../controllers/supplierProduct.controller");

supplierProductRouter.get(
  "/getAllSupplierProducts",
  supplierProductController.getAllSupplierProducts
);
supplierProductRouter.get(
  "/getProductsBySupplier/:supplierId",
  supplierProductController.getProductsBySupplier
);

module.exports = supplierProductRouter;
