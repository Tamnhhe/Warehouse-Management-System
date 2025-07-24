const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdjustmentSchema = new Schema(
  {
    stocktakingTaskId: {
      type: Schema.Types.ObjectId,
      ref: "StocktakingTask",
      required: true,
    },
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
        oldQuantity: { type: Number, required: true }, // Số lượng hệ thống trước điều chỉnh
        newQuantity: { type: Number, required: true }, // Số lượng sau điều chỉnh (bằng actualQuantity)
        difference: { type: Number, required: true }, // Lệch kho
        // Thêm thông tin kệ cho phiếu kiểm kê toàn bộ kho
        inventoryName: { type: String }, // Tên kệ chứa sản phẩm này
        originalInventoryId: { type: Schema.Types.ObjectId, ref: "Inventory" }, // ID kệ gốc chứa sản phẩm
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Người xác nhận điều chỉnh
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Adjustment", AdjustmentSchema);
