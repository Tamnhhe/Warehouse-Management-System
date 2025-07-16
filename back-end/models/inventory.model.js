const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InventorySchema = new Schema(
  {
    name: { type: String, required: true }, // Tên kệ
    location: { type: String }, // Vị trí vật lý trong kho (ví dụ: A1, B2, C3...)
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Đã bỏ trường creator
    maxQuantitative: { type: Number, required: true },
    currentQuantitative: { type: Number, default: 0 },
    maxWeight: { type: Number, required: true },
    currentWeight: { type: Number, default: 0 },
    status: { type: String, default: "active" },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", InventorySchema);
