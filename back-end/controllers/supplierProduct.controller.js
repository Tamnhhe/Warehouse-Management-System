const db = require("../models/index");
const mongoose = require("mongoose");
const SupplierProduct = require("../models/supplierProduct.model");
const Product = require('../models/product.model');

// Get all supplier products
const getAllSupplierProducts = async (req, res) => {
  try {
    const supplierProducts = await SupplierProduct.find()
      .populate("supplier", "name email contact")
      .populate("categoryId", "categoryName");
    res.json({
      success: true,
      data: supplierProducts,
      total: supplierProducts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get supplier products by supplier
const getProductsBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    if (!supplierId) {
      return res.status(400).json({ message: "Nhà cung cấp không hợp lệ." });
    }
    const products = await SupplierProduct.find({ supplier: supplierId })
      .populate("supplier", "name email contact")
      .populate("categoryId", "categoryName");
    res.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

// Create a new supplier product also create a product if it doesn't exist
const createSupplierProduct = async (req, res) => {
  try {
    const {
      supplier,
      stock,
      expiry,
      categoryId,
      productName,
      quantitative,
      unit
    } = req.body;

    console.log("Received data:", req.body);
    const productImage = req.file ? `/uploads/${req.file.filename}` : req.body.productImage;

    // Validate required fields
    if (!supplier) return res.status(400).json({ supplier: 'Nhà cung cấp là bắt buộc.' });
    // if (typeof stock !== 'number' || stock < 0) return res.status(400).json({ message: 'Tồn kho phải là số không âm.' });
    if (!productImage || typeof productImage !== 'string') return res.status(400).json({ image: 'Ảnh sản phẩm là bắt buộc.' });
    if (!productName || typeof productName !== 'string' || !productName.trim()) return res.status(400).json({ name: 'Tên sản phẩm là bắt buộc.' });
    // if (typeof quantitative !== 'number' || quantitative <= 0) return res.status(400).json({ message: 'Định lượng phải là số dương.' });
    if (!unit || typeof unit !== 'string' || !unit.trim()) return res.status(400).json({ unit: 'Đơn vị là bắt buộc.' });
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ category: 'Danh mục phải là ObjectId hợp lệ.' });
    }
    if (expiry && isNaN(Date.parse(expiry))) {
      return res.status(400).json({ expiry: 'Ngày hết hạn không hợp lệ.' });
    }

    const supplierProductExists = await SupplierProduct.findOne({ productName: productName.trim() });
    if (supplierProductExists) {
      return res.status(400).json({ productName: 'Sản phẩm đã tồn tại trong danh sách nhà cung cấp.' });
    }

    // Create new supplier product
    const newSupplierProduct = new SupplierProduct({
      supplier,
      stock,
      expiry,
      categoryId,
      productImage,
      productName: productName.trim(),
      quantitative,
      unit: unit.trim()
    });

    const savedProduct = await newSupplierProduct.save();

    // Check if product already exists
    let product = await Product.findOne({ productName: savedProduct.productName, categoryId: savedProduct.categoryId });
    if (!product) {
      // Create new product
      product = new Product({
        productName: savedProduct.productName,
        categoryId: savedProduct.categoryId,
        productImage: savedProduct.productImage,
        quantitative: savedProduct.quantitative,
        unit: savedProduct.unit,
        thresholdStock: 0, // Default value, can be updated later

      });
      await product.save();
    }

    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Update supplier product by ID
const updateSupplierProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = {};
    const allowedFields = [
      'supplier', 'stock', 'expiry', 'categoryId', 'productName', 'quantitative', 'unit'
    ];
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updateFields[key] = req.body[key];
      }
    }
    // Handle productImage file
    if (req.file) {
      updateFields.productImage = `/uploads/${req.file.filename}`;
    } else if (req.body.productImage) {
      updateFields.productImage = req.body.productImage;
    }

    // Validation for each field if present
    if ('supplier' in updateFields && !updateFields.supplier) return res.status(400).json({ message: 'Supplier is required.' });
    if ('stock' in updateFields && (typeof updateFields.stock !== 'number' || updateFields.stock < 0)) return res.status(400).json({ message: 'Stock must be a non-negative number.' });
    if ('productImage' in updateFields && (!updateFields.productImage || typeof updateFields.productImage !== 'string')) return res.status(400).json({ message: 'Product image is required and must be a string.' });
    if ('productName' in updateFields && (!updateFields.productName || typeof updateFields.productName !== 'string' || !updateFields.productName.trim())) return res.status(400).json({ message: 'Product name is required and must be a non-empty string.' });
    if ('quantitative' in updateFields && (typeof updateFields.quantitative !== 'number' || updateFields.quantitative <= 0)) return res.status(400).json({ message: 'Quantitative must be a positive number.' });
    if ('unit' in updateFields && (!updateFields.unit || typeof updateFields.unit !== 'string' || !updateFields.unit.trim())) return res.status(400).json({ message: 'Unit is required and must be a non-empty string.' });
    if ('categoryId' in updateFields && updateFields.categoryId && !/^[0-9a-fA-F]{24}$/.test(updateFields.categoryId)) return res.status(400).json({ message: 'Category must be a valid ObjectId.' });
    if ('expiry' in updateFields && updateFields.expiry && isNaN(Date.parse(updateFields.expiry))) return res.status(400).json({ message: 'Expiry must be a valid date.' });
    if ('productName' in updateFields) updateFields.productName = updateFields.productName.trim();
    if ('unit' in updateFields) updateFields.unit = updateFields.unit.trim();
    const updatedProduct = await SupplierProduct.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Supplier product not found' });
    }
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete supplier product by ID
const deleteSupplierProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await SupplierProduct.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Supplier product not found' });
    }
    res.json({ success: true, message: 'Supplier product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getAllSupplierProducts,
  getProductsBySupplier,
  createSupplierProduct,
  updateSupplierProduct,
  deleteSupplierProduct
};
