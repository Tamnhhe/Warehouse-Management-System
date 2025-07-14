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
      productImage,
      productName,
      quantitative,
      unit
    } = req.body;
    // Validate required fields
    if (!supplier) return res.status(400).json({ message: 'Supplier is required.' });
    if (typeof stock !== 'number' || stock < 0) return res.status(400).json({ message: 'Stock must be a non-negative number.' });
    if (!productImage || typeof productImage !== 'string') return res.status(400).json({ message: 'Product image is required and must be a string.' });
    if (!productName || typeof productName !== 'string' || !productName.trim()) return res.status(400).json({ message: 'Product name is required and must be a non-empty string.' });
    if (typeof quantitative !== 'number' || quantitative <= 0) return res.status(400).json({ message: 'Quantitative must be a positive number.' });
    if (!unit || typeof unit !== 'string' || !unit.trim()) return res.status(400).json({ message: 'Unit is required and must be a non-empty string.' });
    if (categoryId && !/^[0-9a-fA-F]{24}$/.test(categoryId)) return res.status(400).json({ message: 'Category must be a valid ObjectId.' });
    if (expiry && isNaN(Date.parse(expiry))) return res.status(400).json({ message: 'Expiry must be a valid date.' });
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
    // Check if product already exists
    const existingProduct = await Product.findOne({ productName: newSupplierProduct.productName });
    if (!existingProduct) {
      const newProduct = new Product({
        productName: newSupplierProduct.productName,
        categoryId: newSupplierProduct.categoryId,
        thresholdStock: newSupplierProduct.thresholdStock,
        productImage: newSupplierProduct.productImage,
        unit: newSupplierProduct.unit,
        location: newSupplierProduct.location,
        quantitative: newSupplierProduct.quantitative
      });
      await newProduct.save();
    }
    const savedProduct = await newSupplierProduct.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update supplier product by ID
const updateSupplierProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = {};
    const allowedFields = [
      'supplier', 'stock', 'expiry', 'categoryId', 'productImage', 'productName', 'quantitative', 'unit'
    ];
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updateFields[key] = req.body[key];
      }
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
