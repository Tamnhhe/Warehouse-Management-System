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
  },
  { timestamps: true }
);

module.exports = mongoose.model("StocktakingTask", StocktakingTaskSchema);
