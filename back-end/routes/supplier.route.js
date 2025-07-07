const express = require("express");
const supplierRouter = express.Router();
const { SupplierController } = require("../controllers");
const supplierController = require("../controllers/supplier.controller");

// Lấy danh sách tất cả nhà cung cấp (có hỗ trợ tìm kiếm)
supplierRouter.get("/getAllSuppliers", supplierController.getSuppliers);

// Lấy thông tin chi tiết nhà cung cấp kèm danh sách sản phẩm
supplierRouter.get(
  "/getSupplierWithProducts/:id",
  supplierController.getSupplierWithProducts
);

// Lấy thông tin một nhà cung cấp theo ID
supplierRouter.get("/getSupplierById/:id", supplierController.getSupplierById);

// Lấy danh sách sản phẩm của một nhà cung cấp
supplierRouter.get(
  "/getSupplierProducts/:supplierId",
  supplierController.getSupplierProducts
);

// Tạo mới một nhà cung cấp
supplierRouter.post("/addSupplier", supplierController.createSupplier);

// Cập nhật thông tin nhà cung cấp
supplierRouter.put("/updateSupplier/:id", supplierController.updateSupplier);

//Minh Phuong lay danh sach cac nha cung cap
supplierRouter.get("/get-list-suppliers", supplierController.getAllSuppliers);

//Minh Phuong Inactive nha cung cap
supplierRouter.put("/update-status/:id", supplierController.inactiveSupplier);

module.exports = supplierRouter;
