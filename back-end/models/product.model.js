
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
    location: { //Vi tri
        type: String,
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
