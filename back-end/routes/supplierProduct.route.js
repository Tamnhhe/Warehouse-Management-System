const express = require("express");
const supplierProductRouter = express.Router();
const supplierProductController = require("../controllers/supplierProduct.controller");

// Lấy tất cả sản phẩm của nhà cung cấp (GET)
supplierProductRouter.get(
  "/getAllSupplierProducts",
  supplierProductController.getAllSupplierProducts
);

// Lấy sản phẩm theo nhà cung cấp và theo productId (POST)
// productId có thể có hoặc không (tùy chọn)
supplierProductRouter.get(
  "/getProductsBySupplier/:supplierId/:productId?",
  supplierProductController.getProductsBySupplier
);


// Thêm mới nhập hàng (POST)
supplierProductRouter.post(
  "/addEntry",
  supplierProductController.addSupplierProductEntry
);
supplierProductRouter.post(
  "/export/:supplierId/:productId",
  supplierProductController.exportProductFIFO
);
// Hoàn trả sản phẩm (POST)
supplierProductRouter.post(
  "/return/:supplierId/:productId",
  supplierProductController.returnProducts
);

module.exports = supplierProductRouter;
