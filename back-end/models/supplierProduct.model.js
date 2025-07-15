const mongoose = require('mongoose');


const SupplierProductSchema = new mongoose.Schema({
    supplier: { // Nhà cung cấp
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    stock: { // Số lượng tồn kho của nhà cung cấp này
        type: Number,
        required: true,
        default: 0
    },
    expiry: { // Hạn sử dụng (nếu có)
        type: Date
    },
    categoryId: { // Danh mục sản phẩm
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    productImage: { // Hình ảnh sản phẩm
        type: String,
        required: true // Không bắt buộc nếu không có hình ảnh
    },
    productName: { // Tên sản phẩm
        type: String,
        trim: true,
        required: true 
    },
    quantitative:{
        type: Number, // Đơn vị đo lường (ví dụ: kg, lít, cái, v.v.)
        trim: true,
        required: true
    },
    createdAt: { // Ngày tạo bản ghi
        type: Date,
        default: Date.now
    },
    unit: { // Đơn vị tính của sản phẩm
        type: String,
        trim: true,
        required: true
    },
});

const SupplierProduct = mongoose.model('SupplierProduct', SupplierProductSchema);
module.exports = SupplierProduct;

