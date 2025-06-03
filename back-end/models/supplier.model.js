const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    contact: {
        type: Number
    },
    email: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active',
      },
});

const Supplier = mongoose.model('Supplier', SupplierSchema);
module.exports = Supplier;

