const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Inventory = require("../models/inventory.model");
const SupplierProduct = require("../models/supplierProduct.model");
// Tạo mới một sản phẩm
const createProduct = async (req, res, next) => {
  try {
    let {
      productName,
      categoryId,
      totalStock,
      thresholdStock,
      unit,
      status,
      quantitative,
      location,
      supplierId
    } = req.body;
    const productImage = req.file ? `/uploads/${req.file.filename}` : req.body.productImage;

    // Parse location if sent as array of objects in multipart/form-data
    if (Array.isArray(location)) {
      // location is array of objects, but each field is sent as string
      location = location.map(loc => {
        if (typeof loc === "string") {
          // If loc is '[object Object]', parse it
          try {
            return JSON.parse(loc);
          } catch {
            return loc;
          }
        }
        return loc;
      });
    } else if (typeof location === "object" && location !== null && !Array.isArray(location)) {
      // If location is an object, wrap in array
      location = [location];
    }

    // If location is undefined, try to reconstruct from req.body
    if (!location) {
      // Try to reconstruct from fields like location[0][inventoryId], location[0][stock], etc.
      location = [];
      Object.keys(req.body).forEach(key => {
        const match = key.match(/^location\[(\d+)\]\[(\w+)\]$/);
        if (match) {
          const idx = Number(match[1]);
          const field = match[2];
          if (!location[idx]) location[idx] = {};
          location[idx][field] = req.body[key];
        }
      });
    }

    // Kiểm tra các trường bắt buộc
    if (
      !productName ||
      !categoryId ||
      !productImage ||
      !unit ||
      !status
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

    // Tạo sản phẩm mới
    const newProduct = new Product({
      productName,
      categoryId,
      totalStock: location.reduce((sum, loc) => sum + (loc.stock || 0), 0) || totalStock || 0,
      thresholdStock: thresholdStock || 0,
      productImage,
      unit,
      quantitative: quantitative || 0,
      location: location || [],
      status: status || "active",
    });

    await newProduct.save();

    // Update kệ trong cơ sở dữ liệu
    if (location && Array.isArray(location)) {
      for (const loc of location) {
        if (loc.inventoryId) {
          const inventory = await Inventory.findById(loc.inventoryId);
          if (inventory) {
            inventory.products.push({
              productId: newProduct._id,
              quantity: loc.stock || 0
            });
            await inventory.save();
          }
        }
      }
    }

    // Nếu có supplierId, thêm sản phẩm vào danh sách sản phẩm của nhà cung cấp
    if (supplierId) {
      const supplierProduct = new SupplierProduct({
        supplier: supplierId,
        stock: totalStock || 0,
        categoryId: categoryId,
        productImage,
        productName: productName.trim(),
        quantitative,
        unit: unit.trim()
      });
      await supplierProduct.save();
    }


    res.status(201).json({ message: 'Sản phẩm được tạo thành công', newProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả sản phẩm (populate categoryId và location.inventoryId)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('categoryId', 'categoryName status')
      .populate('location.inventoryId', 'name');
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
      .populate("location.inventoryId");
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
    const {
      productName,
      categoryId,
      totalStock,
      thresholdStock,
      unit,
      quantitative,
      location,
      status,
    } = req.body;
    const productImage = req.file ? `/uploads/${req.file.filename}` : req.body.productImage;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const updatedProduct = {
      productName,
      categoryId,
      totalStock,
      thresholdStock,
      unit,
      quantitative,
      location,
      status
    };
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

const checkProductName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct) {
      return res.status(400).json({
        exists: true,
        message: 'Sản phẩm đã tồn tại trong kho.'
      });
    }
    res.status(200).json({
      exists: false,
      message: 'Tên sản phẩm hợp lệ'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  inactiveProduct,
  checkProductName
};