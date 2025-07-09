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
    location: [{ //Vi tri
       inventoryId: { //Ma kho
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventory', // Reference to the Inventory collection
            required: true,
        },
        stock: { //So luong ton kho
            type: Number,
            required: true,
            default: 0,
        },
    }],
    quantitative: {
        type: Number, // Đơn vị đo lường (ví dụ: kg, lít, cái, v.v.)
        default: 1, // Mặc định là 1 nếu không có giá trị
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
