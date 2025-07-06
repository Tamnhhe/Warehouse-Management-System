const express = require("express");
const supplierProductRouter = express.Router();
const supplierProductController = require("../controllers/supplierProduct.controller");

supplierProductRouter.get(
  "/getAllSupplierProducts",
  supplierProductController.getAllSupplierProducts
);

// Routes cho quản lý sản phẩm trong màn hình nhà cung cấp
supplierProductRouter.get(
  "/supplier/:supplierId/products",
  supplierProductController.getProductsBySupplier
);

supplierProductRouter.get(
  "/supplier/:supplierId/available-products",
  supplierProductController.getAvailableProductsForSupplier
);

supplierProductRouter.post(
  "/supplier/:supplierId/add-product",
  supplierProductController.addProductToSupplier
);

supplierProductRouter.put(
  "/supplier-product/:supplierProductId",
  supplierProductController.updateSupplierProductDetails
);

supplierProductRouter.delete(
  "/supplier-product/:supplierProductId",
  supplierProductController.removeProductFromSupplier
);

supplierProductRouter.get(
  "/supplier/:supplierId/stats",
  supplierProductController.getSupplierProductStats
);

// Routes cũ (để tương thích ngược)
supplierProductRouter.get(
  "/getProductsBySupplier/:supplierId",
  supplierProductController.getProductsBySupplier
);

supplierProductRouter.post(
  "/create",
  supplierProductController.createSupplierProduct
);

supplierProductRouter.put(
  "/update/:id",
  supplierProductController.updateSupplierProduct
);

supplierProductRouter.delete(
  "/delete/:id",
  supplierProductController.deleteSupplierProduct
);

// API để tạo dữ liệu mẫu (chỉ dùng khi cần thiết)
supplierProductRouter.post(
  "/create-sample-data",
  supplierProductController.createSampleData
);

module.exports = supplierProductRouter;
