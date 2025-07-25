const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productName: {
    //tên sản phẩm
    type: String,
    required: true,
    unique: true, // Đảm bảo tên sản phẩm là duy nhất
    trim: true,
  },
  categoryId: {
    //Danh mục
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Reference to the Category collection
    required: true,
  },
  totalStock: {
    //Tong ton kho
    type: Number,
    default: 0, // Mặc định là 0 nếu không có giá trị
  },
  thresholdStock: {
    //Nguong ton kho
    type: Number,
    spare: true,
    required: true,
  },
  productImage: {
    //Anh san pham
    type: String,
    required: true,
  },
  unit: {
    //Don vi
    type: String,
    required: true,
  },
  quantitative: {
    //Cân nặng
    type: Number,
    default: 0,
  },
  location: [
    {
      inventoryId: {
        //Kệ
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory", // Reference to the Inventory collection
        required: true,
      },
      stock: {
        //Tồn kho
        type: Number,
        default: 0, // Mặc định là 0 nếu không có giá trị
      },
      price: {
        //Giá
        type: Number,
        default: 0, // Mặc định là 0 nếu không có giá trị
      },
      totalImportValue: {
        // Tổng tiền nhập của location này
        type: Number,
        default: 0,
      },
    },
  ],
  status: {
    //Trang thái
    type: String,
    required: true,
    enum: ["active", "inactive"],
    default: "active",
  },
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
