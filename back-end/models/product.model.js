// Nguyễn Đức Linh - HE170256 17/1/2025
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productName: { //tên sản phẩm
        type: String,
        required: true,
    },
    categoryId: { //Danh mục
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference to the Category collection
        required: true,
    },
    totalStock: { //Tong so luong
        type: Number,
        required: true,
        default: 0,
    },
    thresholdStock: {   //Nguong ton kho
        type: Number,
        required: true,
    },
    productImage: { //Anh san pham
        type: String,
        required: true,
    },
    unit: { //Don vi
        type: String,
        required: true,
    },
      weight: { //Cân nặng
        type: Number,   
        default: 0,
    },
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
},
    status: { //Trang thái
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active',
    },
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
