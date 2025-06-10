const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productName: { // tên sản phẩm
        type: String,
        required: true,
    },
    categoryId: { // Danh mục
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    supplierId: { // Nhà cung cấp
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true,
    },
    totalStock: { // Tổng số lượng
        type: Number,
        required: true,
        default: 0,
    },
    thresholdStock: { // Ngưỡng tồn kho
        type: Number,
        required: true,
    },
    productImage: { // Ảnh sản phẩm
        type: String,
        required: true,
    },
    unit: { // Đơn vị
        type: String,
        required: true,
    },
    location: { // Vị trí
        type: String,
        required: true,
    },
    status: { // Trạng thái
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active',
    },
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
