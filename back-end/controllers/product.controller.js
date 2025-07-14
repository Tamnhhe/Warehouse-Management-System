// Nguyễn Huy Tâm - HE173108 5/2/2025
const db = require("../models/index");
const Product = require('../models/product.model');
const Category = require('../models/category.model');

// Tạo mới một sản phẩm
const createProduct = async (req, res, next) => {
  try {
    const {
      productName,
      categoryId,
      totalStock,
      thresholdStock,
      productImage,
      unit,
      location,
      quantitative,
      status
    } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : productImage;

    // Kiểm tra các trường bắt buộc
    if (!productName || !categoryId || !image || !unit || !location || typeof thresholdStock !== 'number') {
      return res.status(400).json({ message: 'Thiếu thông tin sản phẩm bắt buộc' });
    }


    // Kiểm tra danh mục
    const checkCategory = await Category.findById(categoryId);
    if (!checkCategory) {
      return res.status(404).json({ message: 'Danh mục không hợp lệ' });
    }
  
    // Kiểm tra mảng vị trí
    if (!Array.isArray(location) || location.length === 0) {
      return res.status(400).json({ message: 'Location phải là một mảng và không được rỗng' });
    }
    for (const loc of location) {
      if (!loc.inventoryId || typeof loc.stock !== 'number') {
        return res.status(400).json({ message: 'Mỗi vị trí phải có inventoryId và stock là số' });
      }
    }
    // Kiểm tra xem tên sản phẩm đã tồn tại trong cơ sở dữ liệu chưa
    const existingProduct = await Product.findOne({ productName });
    if (existingProduct) {
      return res.status(400).json({ message: 'Sản phẩm đã tồn tại trong kho.' });
    }
    const newProduct = new Product({
      productName,
      categoryId,
      totalStock: typeof totalStock === 'number' ? totalStock : 0,
      thresholdStock,
      productImage: image,
      unit,
      location,
      quantitative: typeof quantitative === 'number' ? quantitative : 1,
      status: status || 'active',
    });
    await newProduct.save();
    res.status(201).json({ message: 'Sản phẩm được tạo thành công', newProduct });
  } catch (err) {
    next(err);
  }
};

const getAllProducts = async (req, res) => {
  try {
    // Populate category data to include categoryName
    const products = await db.Product.find().populate('categoryId', 'categoryName status');

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Lấy một sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'categoryName status');
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Cập nhật một sản phẩm theo ID
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      productName,
      categoryId,
      totalStock,
      thresholdStock,
      productImage,
      unit,
      location,
      quantitative,
      status
    } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : productImage;
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    const updateFields = {};
    if (productName) updateFields.productName = productName;
    if (categoryId) updateFields.categoryId = categoryId;
    if (typeof totalStock === 'number') updateFields.totalStock = totalStock;
    if (typeof thresholdStock === 'number') updateFields.thresholdStock = thresholdStock;
    if (image) updateFields.productImage = image;
    if (unit) updateFields.unit = unit;
    if (Array.isArray(location)) updateFields.location = location;
    if (typeof quantitative === 'number') updateFields.quantitative = quantitative;
    if (status) updateFields.status = status;
    const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    res.status(200).json({ message: 'Cập nhật sản phẩm thành công', updatedProduct });
  } catch (error) {
    next(error);
  }
};
// Cập nhật trạng thái sản phẩm (inactive)
const inactiveProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const changedProduct = await Product.findByIdAndUpdate(id, { status }, { new: true });
    if (!changedProduct) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }
    res.status(200).json({ message: 'Trạng thái sản phẩm đã được thay đổi thành công', changedProduct });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  inactiveProduct
};
