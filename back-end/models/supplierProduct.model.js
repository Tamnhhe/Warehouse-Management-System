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
    }
});

const SupplierProduct = mongoose.model('SupplierProduct', SupplierProductSchema);
module.exports = SupplierProduct;

