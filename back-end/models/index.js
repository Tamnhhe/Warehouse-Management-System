const mongoose = require("mongoose");
const Notification = require("./notification.model");
const User = require("./user.model");
const Product = require("./product.model");
const InventoryTransaction = require("./inventoryTransaction.model");
const Category = require("./category.model");
const SupplierProduct = require("./supplierProduct.model");
const Supplier = require("./supplier.model");
const StocktakingTask = require("./stocktakingTask.model");
const Adjustment = require("./adjustment.model");
const Inventory = require("./inventory.model");

const Branch = require("./branch.model");
const db = {};

db.User = User;
db.Product = Product;
db.InventoryTransaction = InventoryTransaction;
db.Notification = Notification;
db.Category = Category;
db.SupplierProduct = SupplierProduct;
db.Supplier = Supplier;
db.StocktakingTask = StocktakingTask;
db.Adjustment = Adjustment;
db.Inventory = Inventory;
db.Branch = Branch;

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
