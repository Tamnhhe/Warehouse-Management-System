// Nguyễn Đức Linh - HE170256 17/1/2025
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
    },
    classifications: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            description: {
                type: String,
            },
        },
    ],
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    description: {
        type: String,
    },
});

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;
