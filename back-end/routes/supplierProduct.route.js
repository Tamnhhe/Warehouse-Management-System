const express = require("express");
const supplierProductRouter = express.Router();
const supplierProductController = require("../controllers/supplierProduct.controller");
const upload = require("../utils/Upload"); // Import upload middleware

supplierProductRouter.get(
  "/getAllSupplierProducts",
  supplierProductController.getAllSupplierProducts
);

// Routes cho quản lý sản phẩm trong màn hình nhà cung cấp
supplierProductRouter.get(
  "/supplier/:supplierId/products",
  supplierProductController.getProductsBySupplier
);

// Routes cũ (để tương thích ngược)
supplierProductRouter.get(
  "/getProductsBySupplier/:supplierId",
  supplierProductController.getProductsBySupplier
);

supplierProductRouter.post(
  "/create",
  upload.single("productImage"),
  supplierProductController.createSupplierProduct
);

supplierProductRouter.put(
  "/update/:id",
  upload.single("productImage"),
  supplierProductController.updateSupplierProduct
);

supplierProductRouter.delete(
  "/delete/:id",
  supplierProductController.deleteSupplierProduct
);

module.exports = supplierProductRouter;
