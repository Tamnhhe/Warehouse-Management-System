
const mongoose = require("mongoose");
const Notification = require("./notification.model");
const User = require("./user.model");
const Product = require("./product.model");
const InventoryTransaction = require("./inventoryTransaction.model");
const Category = require("./category.model");
const SupplierProduct = require("./supplierProduct.model");
const Supplier = require("./supplier.model");
const Customer = require("./customer.model");
const db = {};

db.User = User;
db.Product = Product;
db.InventoryTransaction = InventoryTransaction;
db.Notification = Notification;
db.Category = Category;
db.SupplierProduct = SupplierProduct;
db.Supplier = Supplier;
db.Customer = Customer;
db.connectDB = async () => {
  try { 
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Kết thúc quá trình nếu có lỗi
  }
};

module.exports = db;
