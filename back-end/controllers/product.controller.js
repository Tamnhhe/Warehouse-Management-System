const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Inventory = require("../models/inventory.model");

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
      inventoryId,
      status,
      weight, // thêm cân nặng
    } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : productImage;

    // Kiểm tra các trường bắt buộc
    if (
      !productName ||
      !categoryId ||
      !productImage ||
      !unit ||
      !inventoryId
    ) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin sản phẩm bắt buộc" });
    }

    // Kiểm tra xem tên sản phẩm đã tồn tại trong cơ sở dữ liệu chưa
    const existingProduct = await Product.findOne({ productName });
    if (existingProduct) {
      return res.status(400).json({ message: 'Sản phẩm đã tồn tại trong kho.' });
    }

    // Kiểm tra danh mục
    const checkCategory = await Category.findById(categoryId);
    if (!checkCategory) {
      return res
        .status(404)
        .json({ message: "Định dạng danh mục không hợp lệ" });
    }

    // Kiểm tra inventoryId có tồn tại không
    const checkInventory = await Inventory.findById(inventoryId);
    if (!checkInventory) {
      return res
        .status(404)
        .json({ message: "Kệ không tồn tại" });
    }

    // Tạo sản phẩm mới
    const newProduct = new Product({
      productName,
      categoryId,
      totalStock: totalStock || 0,
      thresholdStock: thresholdStock || 0,
      productImage,
      unit,
      inventoryId,
      status: status || "active",
      weight: weight || 0, // thêm cân nặng
    });

    await newProduct.save();
    res.status(201).json({ message: 'Sản phẩm được tạo thành công', newProduct });
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả sản phẩm (populate inventoryId)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('categoryId', 'categoryName status')
      .populate('inventoryId', 'name');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy một sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId")
      .populate("inventoryId");
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật sản phẩm
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { productName, categoryId, thresholdStock, unit, inventoryId, status, weight } = req.body;
    const productImage = req.file ? `/uploads/${req.file.filename}` : req.body.productImage;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const updatedProduct = { productName, categoryId, thresholdStock, unit, inventoryId, status, weight };
    if (productImage) updatedProduct.productImage = productImage;

    const product = await Product.findByIdAndUpdate(id, { $set: updatedProduct }, { new: true });
    res.status(200).json({ message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    next(error);
  }
}

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
  inactiveProduct,
};