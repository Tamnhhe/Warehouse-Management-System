const db = require("../models/index");

// Tạo mới một sản phẩm
const createProduct = async (req, res, next) => {
  try {
    const {
      productName,
      categoryId,
      supplierId, // Thêm supplierId
      totalStock,
      thresholdStock,
      unit,
      location,
      status,
    } = req.body;

    const productImage = req.file ? `/uploads/${req.file.filename}` : req.body.productImage;

    if (!productName || !categoryId || !supplierId || !productImage || !unit || !location) {
      return res.status(400).json({ message: "Thiếu thông tin sản phẩm bắt buộc" });
    }

    const existingProduct = await db.Product.findOne({ productName });
    if (existingProduct) {
      return res.status(400).json({ message: "Sản phẩm đã tồn tại trong kho." });
    }

    const checkCategory = await db.Category.findById(categoryId);
    if (!checkCategory) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    const checkSupplier = await db.Supplier.findById(supplierId);
    if (!checkSupplier) {
      return res.status(404).json({ message: "Nhà cung cấp không tồn tại" });
    }

    const newProduct = new db.Product({
      productName,
      categoryId,
      supplierId,
      totalStock: totalStock || 0,
      thresholdStock: thresholdStock || 0,
      productImage,
      unit,
      location,
      status: status || "active",
    });

    await newProduct.save();
    res.status(201).json({ message: "Sản phẩm được tạo thành công", newProduct });
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả sản phẩm
const getAllProducts = async (req, res) => {
  try {
    const products = await db.Product.find()
      .populate("categoryId", "categoryName status")
      .populate("supplierId", "name"); // Populate name của nhà cung cấp
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy một sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const product = await db.Product.findById(req.params.id)
      .populate("categoryId", "categoryName status")
      .populate("supplierId", "name"); // Populate name của nhà cung cấp
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      productName,
      categoryId,
      supplierId,
      thresholdStock,
      unit,
      location,
    } = req.body;

    const productImage = req.file ? `/uploads/${req.file.filename}` : req.body.productImage;

    const existingProduct = await db.Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const updatedProduct = {
      productName,
      categoryId,
      supplierId,
      thresholdStock,
      unit,
      location,
    };

    if (productImage) updatedProduct.productImage = productImage;

    const product = await db.Product.findByIdAndUpdate(id, { $set: updatedProduct }, { new: true });
    res.status(200).json({ message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    next(error);
  }
};

// Cập nhật trạng thái sản phẩm
const inactiveProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const changedProduct = await db.Product.findByIdAndUpdate(id, { status }, { new: true });
    if (!changedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }

    res.status(200).json({ message: "Trạng thái sản phẩm đã được thay đổi thành công", changedProduct });
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