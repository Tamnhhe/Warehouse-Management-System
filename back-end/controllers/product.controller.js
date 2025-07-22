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
      supplierId,
    } = req.body;
    const productImage = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.productImage;

    // Parse location if sent as array of objects in multipart/form-data
    if (Array.isArray(location)) {
      // location is array of objects, but each field is sent as string
      location = location.map((loc) => {
        if (typeof loc === "string") {
          try {
            return JSON.parse(loc);
          } catch {
            return loc;
          }
        }
        return loc;
      });
    } else if (
      typeof location === "object" &&
      location !== null &&
      !Array.isArray(location)
    ) {
      location = [location];
    }

    // If location is undefined, try to reconstruct from req.body
    if (!location) {
      location = [];
      Object.keys(req.body).forEach((key) => {
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
        .json({ message: "Sản phẩm đã tồn tại trong kho." });
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

    // Update kệ trong cơ sở dữ liệu
    if (location && Array.isArray(location)) {
      for (const loc of location) {
        if (loc.inventoryId) {
          const inventory = await Inventory.findById(loc.inventoryId);
          //Update quantitative left and stock in inventory
          if (inventory) {
            inventory.currentQuantitative += loc.stock*quantitative || 0;
            inventory.products.push({
              productId: newProduct._id,
              quantity: loc.stock || 0,
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

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
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

    //Update inventory stock and quantitative left
    if (location && Array.isArray(location)) {
      for (const loc of location) {
        if (loc.inventoryId) {
          const inventory = await Inventory.findById(loc.inventoryId);
          //Update quantitative left and stock in inventory with updated values
          if (inventory) {
            const existingProductInInventory = inventory.products.find(
              (p) => p.productId.toString() === product._id.toString()
            );
            if (existingProductInInventory) {
              inventory.currentQuantitative -= existingProductInInventory.quantity * quantitative || 0;
              existingProductInInventory.quantity = loc.stock || 0;
            } else {
              inventory.products.push({
                productId: product._id,
                quantity: loc.stock || 0,
              });
            }
            inventory.currentQuantitative += loc.stock * quantitative || 0;
            await inventory.save();
          }
        }
      }
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
