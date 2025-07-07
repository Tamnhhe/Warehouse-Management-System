const db = require("../models/index");
const mongoose = require("mongoose");

const SupplierProduct = db.SupplierProduct;

// Lấy danh sách sản phẩm theo nhà cung cấp (chi tiết đầy đủ cho màn quản lý)
const getProductsBySupplier = async (req, res) => {
  try {
    // Add cache-busting headers
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Last-Modified": new Date().toUTCString(),
      ETag: `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`,
    });

    const { supplierId } = req.params;
    const { includeAll = false } = req.query; // Tham số để lấy cả sản phẩm inactive

    if (!supplierId) {
      return res.status(400).json({ message: "Nhà cung cấp không hợp lệ." });
    }

    console.log(
      `[SupplierProductController] Fetching products for supplier ${supplierId} with cache-busting headers...`
    );

    const supplierObjectId = new mongoose.Types.ObjectId(supplierId);

    // Query để lấy sản phẩm
    const matchCondition = includeAll === "true" ? {} : { status: "active" };

    const products = await SupplierProduct.find({
      supplier: supplierObjectId,
    })
      .populate({
        path: "product",
        match: matchCondition,
        populate: {
          path: "categoryId",
          model: "Category",
          select: "categoryName",
        },
      })
      .populate({
        path: "supplier",
        select: "name email contact",
      });

    // Lọc bỏ những document có product null (vì match filter)
    const filteredProducts = products.filter((sp) => sp.product !== null);

    console.log(
      `[SupplierProductController] Found ${filteredProducts.length} products for supplier ${supplierId}`
    );

    return res.json({
      success: true,
      data: filteredProducts.map((sp) => ({
        supplierProductId: sp._id,
        productId: sp.product?._id || null,
        productName: sp.product?.productName || "Không có tên",
        productDescription: sp.product?.description || "",
        price: sp.price,
        stock: sp.stock,
        expiry: sp.expiry,
        categoryId: sp.product?.categoryId?._id || null,
        categoryName: sp.product?.categoryId?.categoryName || "Chưa phân loại",
        status: sp.product?.status || "inactive",
        createdAt: sp.createdAt,
        updatedAt: sp.updatedAt,
      })),
      total: filteredProducts.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo nhà cung cấp:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};
const getAllSupplierProducts = async (req, res) => {
  try {
    // Add cache-busting headers
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Last-Modified": new Date().toUTCString(),
      ETag: `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`,
    });

    console.log(
      "[SupplierProductController] Fetching all supplier products with cache-busting headers..."
    );

    const supplierProducts = await db.SupplierProduct.find()
      .populate("product")
      .populate("supplier");

    console.log("supplierProducts:", supplierProducts);
    console.log(
      `[SupplierProductController] Found ${supplierProducts.length} supplier products`
    );

    if (!supplierProducts || supplierProducts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không tìm thấy sản phẩm nào.",
        data: [],
        total: 0,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      data: supplierProducts,
      total: supplierProducts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ.",
      error: error.message,
    });
  }
};

// Tạo quan hệ supplier-product
const createSupplierProduct = async (req, res) => {
  try {
    const { supplierId, productId, price, stock, expiry } = req.body;

    if (!supplierId || !productId || !price) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc: supplierId, productId, price",
      });
    }

    // Kiểm tra supplier và product có tồn tại không
    const [supplier, product] = await Promise.all([
      db.Supplier.findById(supplierId),
      db.Product.findById(productId),
    ]);

    if (!supplier) {
      return res.status(404).json({ message: "Nhà cung cấp không tồn tại" });
    }
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra quan hệ đã tồn tại chưa
    const existingRelation = await SupplierProduct.findOne({
      supplier: supplierId,
      product: productId,
    });

    if (existingRelation) {
      return res.status(400).json({
        message: "Quan hệ nhà cung cấp - sản phẩm đã tồn tại",
      });
    }

    const newSupplierProduct = new SupplierProduct({
      supplier: supplierId,
      product: productId,
      price: price,
      stock: stock || 0,
      expiry: expiry || null,
    });

    await newSupplierProduct.save();

    const populatedData = await SupplierProduct.findById(newSupplierProduct._id)
      .populate("supplier", "name email")
      .populate({
        path: "product",
        populate: {
          path: "categoryId",
          model: "Category",
          select: "categoryName",
        },
      });

    return res.status(201).json({
      message: "Tạo quan hệ nhà cung cấp - sản phẩm thành công",
      data: populatedData,
    });
  } catch (error) {
    console.error("Lỗi khi tạo quan hệ supplier-product:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Cập nhật quan hệ supplier-product
const updateSupplierProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock, expiry } = req.body;

    const supplierProduct = await SupplierProduct.findById(id);
    if (!supplierProduct) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy quan hệ nhà cung cấp - sản phẩm" });
    }

    if (price !== undefined) supplierProduct.price = price;
    if (stock !== undefined) supplierProduct.stock = stock;
    if (expiry !== undefined) supplierProduct.expiry = expiry;

    await supplierProduct.save();

    const populatedData = await SupplierProduct.findById(id)
      .populate("supplier", "name email")
      .populate({
        path: "product",
        populate: {
          path: "categoryId",
          model: "Category",
          select: "categoryName",
        },
      });

    return res.json({
      message: "Cập nhật quan hệ nhà cung cấp - sản phẩm thành công",
      data: populatedData,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật quan hệ supplier-product:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Xóa quan hệ supplier-product
const deleteSupplierProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const supplierProduct = await SupplierProduct.findById(id);
    if (!supplierProduct) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy quan hệ nhà cung cấp - sản phẩm" });
    }

    await SupplierProduct.findByIdAndDelete(id);

    return res.json({
      message: "Xóa quan hệ nhà cung cấp - sản phẩm thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa quan hệ supplier-product:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Tạo dữ liệu mẫu cho SupplierProduct (chỉ sử dụng khi cần thiết)
const createSampleData = async (req, res) => {
  try {
    // Lấy tất cả suppliers và products
    const [suppliers, products] = await Promise.all([
      db.Supplier.find({ status: "active" }).limit(3),
      db.Product.find({ status: "active" }).limit(5),
    ]);

    if (suppliers.length === 0 || products.length === 0) {
      return res.status(400).json({
        message:
          "Cần có ít nhất 1 supplier và 1 product active để tạo dữ liệu mẫu",
      });
    }

    // Tạo quan hệ mẫu (mỗi supplier có 2-3 sản phẩm)
    const sampleData = [];
    for (let i = 0; i < suppliers.length; i++) {
      const supplier = suppliers[i];
      const numProducts = Math.min(
        2 + Math.floor(Math.random() * 2),
        products.length
      ); // 2-3 sản phẩm

      for (let j = 0; j < numProducts; j++) {
        const product = products[(i * numProducts + j) % products.length];

        // Kiểm tra quan hệ đã tồn tại chưa
        const existingRelation = await SupplierProduct.findOne({
          supplier: supplier._id,
          product: product._id,
        });

        if (!existingRelation) {
          sampleData.push({
            supplier: supplier._id,
            product: product._id,
            price: 10000 + Math.floor(Math.random() * 90000), // Giá từ 10k-100k
            stock: Math.floor(Math.random() * 100) + 10, // Stock từ 10-110
            expiry: new Date(
              Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000
            ), // Hạn sử dụng trong 1 năm
          });
        }
      }
    }

    if (sampleData.length === 0) {
      return res.json({ message: "Tất cả quan hệ đã tồn tại" });
    }

    const createdData = await SupplierProduct.insertMany(sampleData);

    return res.status(201).json({
      message: `Đã tạo ${createdData.length} quan hệ supplier-product mẫu`,
      data: createdData,
    });
  } catch (error) {
    console.error("Lỗi khi tạo dữ liệu mẫu:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Lấy danh sách sản phẩm có thể thêm vào nhà cung cấp (chưa có quan hệ)
const getAvailableProductsForSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { search = "" } = req.query;

    if (!supplierId) {
      return res.status(400).json({ message: "Nhà cung cấp không hợp lệ." });
    }

    // Lấy danh sách productId đã có quan hệ với supplier này
    const existingRelations = await SupplierProduct.find({
      supplier: supplierId,
    }).select("product");

    const existingProductIds = existingRelations.map((rel) => rel.product);

    // Tìm các sản phẩm chưa có quan hệ với supplier này
    const searchQuery = {
      _id: { $nin: existingProductIds },
      status: "active",
    };

    if (search) {
      searchQuery.productName = { $regex: search, $options: "i" };
    }

    const availableProducts = await db.Product.find(searchQuery)
      .populate("categoryId", "categoryName")
      .select("productName description categoryId")
      .limit(50);

    return res.json({
      success: true,
      data: availableProducts.map((product) => ({
        productId: product._id,
        productName: product.productName,
        description: product.description,
        categoryId: product.categoryId?._id,
        categoryName: product.categoryId?.categoryName || "Chưa phân loại",
      })),
      total: availableProducts.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm có thể thêm:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

// Thêm sản phẩm vào nhà cung cấp (từ màn quản lý nhà cung cấp)
const addProductToSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { productId, price, stock = 0, expiry } = req.body;

    if (!supplierId || !productId || !price) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc: supplierId, productId, price",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Giá phải lớn hơn 0",
      });
    }

    // Kiểm tra supplier và product có tồn tại không
    const [supplier, product] = await Promise.all([
      db.Supplier.findById(supplierId),
      db.Product.findById(productId),
    ]);

    if (!supplier) {
      return res.status(404).json({ message: "Nhà cung cấp không tồn tại" });
    }
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra quan hệ đã tồn tại chưa
    const existingRelation = await SupplierProduct.findOne({
      supplier: supplierId,
      product: productId,
    });

    if (existingRelation) {
      return res.status(400).json({
        message: "Sản phẩm đã được thêm vào nhà cung cấp này",
      });
    }

    const newSupplierProduct = new SupplierProduct({
      supplier: supplierId,
      product: productId,
      price: price,
      stock: stock || 0,
      expiry: expiry || null,
    });

    await newSupplierProduct.save();

    const populatedData = await SupplierProduct.findById(newSupplierProduct._id)
      .populate("supplier", "name email contact")
      .populate({
        path: "product",
        populate: {
          path: "categoryId",
          model: "Category",
          select: "categoryName",
        },
      });

    return res.status(201).json({
      success: true,
      message: "Thêm sản phẩm vào nhà cung cấp thành công",
      data: {
        supplierProductId: populatedData._id,
        productId: populatedData.product._id,
        productName: populatedData.product.productName,
        productDescription: populatedData.product.description,
        price: populatedData.price,
        stock: populatedData.stock,
        expiry: populatedData.expiry,
        categoryId: populatedData.product.categoryId?._id,
        categoryName: populatedData.product.categoryId?.categoryName,
        status: populatedData.product.status,
      },
    });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào nhà cung cấp:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Cập nhật thông tin sản phẩm của nhà cung cấp (giá, tồn kho, hạn sử dụng)
const updateSupplierProductDetails = async (req, res) => {
  try {
    const { supplierProductId } = req.params;
    const { price, stock, expiry } = req.body;

    if (!supplierProductId) {
      return res.status(400).json({ message: "ID quan hệ không hợp lệ" });
    }

    const supplierProduct = await SupplierProduct.findById(supplierProductId);
    if (!supplierProduct) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy quan hệ nhà cung cấp - sản phẩm" });
    }

    // Validate dữ liệu
    if (price !== undefined) {
      if (price <= 0) {
        return res.status(400).json({ message: "Giá phải lớn hơn 0" });
      }
      supplierProduct.price = price;
    }

    if (stock !== undefined) {
      if (stock < 0) {
        return res.status(400).json({ message: "Tồn kho không được âm" });
      }
      supplierProduct.stock = stock;
    }

    if (expiry !== undefined) {
      supplierProduct.expiry = expiry;
    }

    await supplierProduct.save();

    const populatedData = await SupplierProduct.findById(supplierProductId)
      .populate("supplier", "name email contact")
      .populate({
        path: "product",
        populate: {
          path: "categoryId",
          model: "Category",
          select: "categoryName",
        },
      });

    return res.json({
      success: true,
      message: "Cập nhật thông tin sản phẩm thành công",
      data: {
        supplierProductId: populatedData._id,
        productId: populatedData.product._id,
        productName: populatedData.product.productName,
        productDescription: populatedData.product.description,
        price: populatedData.price,
        stock: populatedData.stock,
        expiry: populatedData.expiry,
        categoryId: populatedData.product.categoryId?._id,
        categoryName: populatedData.product.categoryId?.categoryName,
        status: populatedData.product.status,
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Xóa sản phẩm khỏi nhà cung cấp
const removeProductFromSupplier = async (req, res) => {
  try {
    const { supplierProductId } = req.params;

    if (!supplierProductId) {
      return res.status(400).json({ message: "ID quan hệ không hợp lệ" });
    }

    const supplierProduct = await SupplierProduct.findById(supplierProductId)
      .populate("product", "productName")
      .populate("supplier", "name");

    if (!supplierProduct) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy quan hệ nhà cung cấp - sản phẩm" });
    }

    const productName = supplierProduct.product?.productName || "Sản phẩm";
    const supplierName = supplierProduct.supplier?.name || "Nhà cung cấp";

    await SupplierProduct.findByIdAndDelete(supplierProductId);

    return res.json({
      success: true,
      message: `Đã xóa sản phẩm "${productName}" khỏi nhà cung cấp "${supplierName}"`,
    });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi nhà cung cấp:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Lấy thống kê sản phẩm của nhà cung cấp
const getSupplierProductStats = async (req, res) => {
  try {
    const { supplierId } = req.params;

    if (!supplierId) {
      return res.status(400).json({ message: "Nhà cung cấp không hợp lệ." });
    }

    const stats = await SupplierProduct.aggregate([
      { $match: { supplier: new mongoose.Types.ObjectId(supplierId) } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ["$productInfo.status", "active"] }, 1, 0] },
          },
          inactiveProducts: {
            $sum: {
              $cond: [{ $eq: ["$productInfo.status", "inactive"] }, 1, 0],
            },
          },
          totalStock: { $sum: "$stock" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    const result = stats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0,
      totalStock: 0,
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
    };

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports = {
  getAllSupplierProducts,
  getProductsBySupplier,
  createSupplierProduct,
  updateSupplierProduct,
  deleteSupplierProduct,
  createSampleData,
  getAvailableProductsForSupplier,
  addProductToSupplier,
  updateSupplierProductDetails,
  removeProductFromSupplier,
  getSupplierProductStats,
};
