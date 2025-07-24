const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StocktakingTaskSchema = new Schema(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        systemQuantity: { type: Number, required: true }, // Số lượng hệ thống
        actualQuantity: { type: Number }, // Số lượng thực tế kiểm kê - không bắt buộc khi pending
        difference: { type: Number }, // Lệch kho
        note: { type: String }, // Ghi chú cho sản phẩm kiểm kê
        // Thêm thông tin kệ cho phiếu kiểm kê toàn bộ kho
        inventoryName: { type: String }, // Tên kệ chứa sản phẩm này
        originalInventoryId: { type: Schema.Types.ObjectId, ref: "Inventory" }, // ID kệ gốc chứa sản phẩm
      },
    ],
    auditor: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Người kiểm kê
    checkedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "completed", "adjusted"], // Thêm trạng thái "adjusted"
      default: "pending",
    },
    adjustmentId: { type: Schema.Types.ObjectId, ref: "Adjustment" }, // Nếu có phiếu điều chỉnh
    // Thêm trường để đánh dấu phiếu kiểm kê toàn bộ kho
    isWarehouseStocktaking: { type: Boolean, default: false },
    // Lưu thông tin các kệ liên quan đến phiếu kiểm kê toàn bộ kho
    relatedInventories: [
      {
        inventoryId: { type: Schema.Types.ObjectId, ref: "Inventory" },
        inventoryName: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("StocktakingTask", StocktakingTaskSchema);
