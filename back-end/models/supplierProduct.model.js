const mongoose = require('mongoose');

const SupplierProductSchema = new mongoose.Schema({
    supplier: { // Nhà cung cấp
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    product: { // Sản phẩm
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    price: { // Giá nhập từ nhà cung cấp
        type: Number,
        required: true,
        min: 0
    },
    stock: { // Số lượng tồn kho của nhà cung cấp này
        type: Number,
        required: true,
        default: 0
    },
    expiry: { // Hạn sử dụng (nếu có)
        type: Date
    },
    Category: { // Danh mục sản phẩm
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    productImage: { // Hình ảnh sản phẩm
        type: String,
        required: true
    },
    productName: { // Tên sản phẩm
        type: String,
        required: true,
        trim: true
    },
    quantitative:{
        type: Number, // Đơn vị đo lường (ví dụ: kg, lít, cái, v.v.)
        required: true,
        trim: true
    },
    createdAt: { // Ngày tạo bản ghi
        type: Date,
        default: Date.now
    },
    unit: { // Đơn vị tính của sản phẩm
        type: String,
        required: true,
        trim: true
    },
});

const SupplierProduct = mongoose.model('SupplierProduct', SupplierProductSchema);
module.exports = SupplierProduct;

