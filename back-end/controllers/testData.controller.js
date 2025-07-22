const fs = require("fs");
const path = require("path");
const db = require("../models");
const mongoose = require("mongoose");

// Map file name to model name
const fileModelMap = {
  "WHS.adjustments.json": db.Adjustment,
  "WHS.products.json": db.Product,
  "WHS.inventories.json": db.Inventory,
  "WHS.categories.json": db.Category,
  "WHS.suppliers.json": db.Supplier,
  "WHS.supplierProducts.json": db.SupplierProduct,
  "WHS.inventoryTransactions.json": db.InventoryTransaction,
};

// Đệ quy chuyển đổi các trường đặc biệt sang ObjectId/Date
function convertSpecialTypes(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertSpecialTypes);
  } else if (obj && typeof obj === "object") {
    // ObjectId
    if (Object.keys(obj).length === 1 && obj.$oid) {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    // Date
    if (Object.keys(obj).length === 1 && obj.$date) {
      return new Date(obj.$date);
    }
    // Đệ quy cho các thuộc tính khác
    const newObj = {};
    for (const key in obj) {
      newObj[key] = convertSpecialTypes(obj[key]);
    }
    return newObj;
  }
  return obj;
}

// Import all data from docs/data
exports.importTestData = async (req, res) => {
  try {
    const dataDir = path.join(__dirname, "../docs/data");
    const importResults = [];
    for (const [file, Model] of Object.entries(fileModelMap)) {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        let docs = JSON.parse(raw);
        docs = convertSpecialTypes(docs);
        await Model.deleteMany({});
        await Model.insertMany(docs);
        importResults.push(`${file} imported: ${docs.length} records`);
      } else {
        importResults.push(`${file} not found`);
      }
    }
    res.json({ success: true, message: importResults.join("; ") });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Clear all data except User
exports.clearTestData = async (req, res) => {
  try {
    for (const [file, Model] of Object.entries(fileModelMap)) {
      await Model.deleteMany({});
    }
    res.json({ success: true, message: "All test data cleared except User." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
