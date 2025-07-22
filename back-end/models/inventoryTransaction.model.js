const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier", // Đảm bảo đúng model
      required: true,
    },
    transactionType: {
      //xác đinh xem xuất hay nhập
      type: String,
      required: true,
      enum: ["import", "export"],
    },
    transactionDate: {
      //Ngày xuất nhà cung cấp
      type: Date,
      required: true,
      default: Date.now,
    },
    products: [
      //Danh sách sản phẩm
      {
        supplierProductId: {
          //ID sản phẩm từ nhà cung cấp
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "SupplierProduct",
        },
        productId: {
          //ID sản phẩm trong hệ thống
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        requestQuantity: {
          //So luong san pham mong muon
          type: Number,
          min: 0,
        },
        receiveQuantity: {
          //So luong san pham nhan dươc
          type: Number,
          min: 0,
        },
        defectiveProduct: {
          //So luong san pham loi
          type: Number,
          min: 0,
        },
        achievedProduct: {
          //So luong san pham chap nhan
          type: Number,
          min: 0,
        },
        price: {
          //Giá bán
          type: Number,
          min: 0,
        },
        expiry: {
          //nngaf heetts hạn
          type: Date,
        },
        quantitative: { type: Number, default: 0 },
      },
    ],
    operator: {
      //Nhân viên chiu trách  nhiệm cho đơn
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: "User",
    },
    notification: {
      //Thong bao
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Notification",
    },
    totalPrice: {
      //Tong tien
      type: Number,
      required: true,
      min: 0,
    },
    branch: {
      //Chi nhanh
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    status: {
      //Trang thái
      type: String,
      required: true,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const inventoryTransaction = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);
module.exports = inventoryTransaction;
