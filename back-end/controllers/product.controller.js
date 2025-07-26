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
      location,
      quantitative,
      supplierId,
    } = req.body;
    const productImage = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.productImage;

    // Kiểm tra các trường bắt buộc
    if (!productName || !categoryId || !productImage || !unit || !status) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin sản phẩm bắt buộc" });
    }

    // Kiểm tra xem tên sản phẩm đã tồn tại trong cơ sở dữ liệu chưa
    const existingProduct = await Product.findOne({ productName });
    if (existingProduct) {
      return res
        .status(400)
        .json({ productName: "Sản phẩm đã tồn tại trong kho." });
    }

    // Kiểm tra danh mục
    const checkCategory = await Category.findById(categoryId);
    if (!checkCategory) {
      return res
        .status(404)
        .json({ categoryId: "Định dạng danh mục không hợp lệ" });
    }

    // Tạo sản phẩm mới
    const newProduct = new Product({
      productName,
      categoryId,
      totalStock:
        location.reduce((sum, loc) => sum + Number(loc.stock || 0), 0) ||
        totalStock ||
        0,
      thresholdStock: thresholdStock || 0,
      productImage,
      unit,
      quantitative: quantitative || 0,
      location: location || [],
      status: status || "active",
    });

    await newProduct.save();

    // Nếu có supplierId, thêm sản phẩm vào danh sách sản phẩm của nhà cung cấp
    if (supplierId) {
      const supplierProduct = new SupplierProduct({
        supplier: supplierId,
        stock: totalStock || 0,
        categoryId: categoryId,
        productImage,
        productName: productName.trim(),
        quantitative,
        unit: unit.trim(),
      });
      await supplierProduct.save();
    }

    res
      .status(201)
      .json({ message: "Sản phẩm được tạo thành công", newProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả sản phẩm (populate categoryId và location.inventoryId)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "categoryName status")
      .populate("location.inventoryId", "name");
    const response = products.map((product) => ({
      ...product.toObject(),
      categoryName: product.categoryId?.categoryName || "Không xác định",
      locations: product.location.map((loc) => ({
        ...loc,
        inventoryName: loc.inventoryId?.name || "Không xác định",
      })),
      importPrice: product.location.reduce(
        (sum, loc) => sum + (loc.price || 0) * (loc.stock || 0),
        0
      ) / product.totalStock || 0,
    }));
    res.status(200).json(response);
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
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
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
    const productImage = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.productImage;

    const existingProductName = await Product.findOne({ productName });
    if (existingProductName) {
      return res.status(400).json({ productName: "Sản phẩm đã tồn tại trong kho." });
    }

    const formattedLocation = Array.isArray(location)
      ? location.map((loc) => ({
        inventoryId: loc.inventoryId?._id || loc.inventoryId,
        stock: loc.stock,
      }))
      : location;


    const updatedProduct = {
      productName,
      categoryId,
      totalStock: location.reduce((sum, loc) => sum + Number(loc.stock || 0), 0) || totalStock || 0,
      thresholdStock,
      unit,
      quantitative,
      location: formattedLocation,
      status,
    };
    if (productImage) updatedProduct.productImage = productImage;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updatedProduct },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }

    res.status(200).json({ message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

// Cập nhật sản phẩm và xử lý thay đổi nhà cung cấp
const updateProductWithSupplier = async (req, res, next) => {
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
      supplierId,
      originalSupplierId,
      createSupplierProduct,
    } = req.body;
    console.log("Location:", location);
    const productImage = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.productImage;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // 1. Xóa supplier product hiện có nếu có originalSupplierId
    if (originalSupplierId) {
      // Tìm supplier product liên quan đến sản phẩm này với supplier cũ
      const existingSupplierProduct = await SupplierProduct.findOne({
        productName: existingProduct.productName,
        supplier: originalSupplierId,
      });

      if (existingSupplierProduct) {
        await SupplierProduct.findByIdAndDelete(existingSupplierProduct._id);
      }
    }

    // 2. Tạo supplier product mới nếu chọn supplier mới
    if (createSupplierProduct === "true" && supplierId) {
      const newSupplierProduct = new SupplierProduct({
        supplier: supplierId,
        stock: totalStock || 0,
        categoryId: categoryId,
        productImage: productImage || existingProduct.productImage,
        productName: productName.trim(),
        quantitative: quantitative || 0,
        unit: unit.trim(),
      });
      await newSupplierProduct.save();
    }

    // 3. Cập nhật sản phẩm
    const updatedProduct = {
      productName,
      categoryId,
      totalStock: location.reduce((sum, loc) => sum + (loc.stock || 0), 0) || totalStock || 0,
      thresholdStock,
      unit,
      quantitative,
      location,
      status,
    };
    if (productImage) updatedProduct.productImage = productImage;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updatedProduct },
      { new: true }
    );
    res.status(200).json({
      message: "Cập nhật sản phẩm và thông tin nhà cung cấp thành công",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin nhà cung cấp của sản phẩm
const getProductSupplier = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Lấy thông tin sản phẩm
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Tìm supplier product dựa trên tên sản phẩm
    const supplierProduct = await SupplierProduct.findOne({
      productName: product.productName,
    }).populate("supplier", "name email phone address");

    res.status(200).json({
      success: true,
      supplierProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật trạng thái sản phẩm (inactive)
const inactiveProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const changedProduct = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!changedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }
    res
      .status(200)
      .json({
        message: "Trạng thái sản phẩm đã được thay đổi thành công",
        changedProduct,
      });
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
        message: "Sản phẩm đã tồn tại trong kho.",
      });
    }
    res.status(200).json({
      exists: false,
      message: "Tên sản phẩm hợp lệ",
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
  updateProductWithSupplier,
  getProductSupplier,
  inactiveProduct,
  checkProductName,
};
