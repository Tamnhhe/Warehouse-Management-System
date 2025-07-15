const db = require("../models/index");
const Supplier = db.Supplier;
const SupplierProduct = db.SupplierProduct;

// Lấy danh sách nhà cung cấp (có hỗ trợ tìm kiếm)
exports.getSuppliers = async (req, res) => {
  try {
    const { name } = req.query;
    const query = name ? { name: { $regex: name, $options: "i" } } : {};
    const suppliers = await Supplier.find(query).select("_id name status");
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
//- Ham lấy suppliers
exports.getAllSuppliers = async (req, res, next) => {
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
      "[SupplierController] Fetching all suppliers with cache-busting headers..."
    );
    const suppliers = await Supplier.find({});
    console.log(`[SupplierController] Found ${suppliers.length} suppliers`);

    res.status(200).json({
      success: true,
      data: suppliers,
      total: suppliers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Lỗi lấy dữ liệu các nhà cung cấp:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
// Lấy danh sách sản phẩm của nhà cung cấp
exports.getSupplierProducts = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const supplierProducts = await SupplierProduct.find({
      supplier: supplierId,
    }).populate("product", "productName");

    if (!supplierProducts.length) {
      return res
        .status(404)
        .json({ message: "No products found for this supplier." });
    }

    res.json(supplierProducts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy thông tin chi tiết nhà cung cấp
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Tạo nhà cung cấp mớiconst Supplier = require('../models/Supplier');

exports.createSupplier = async (req, res) => {
  try {
    const { name, contact, email, status } = req.body;

    // Kiểm tra bắt buộc
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Kiểm tra nhà cung cấp đã tồn tại chưa (theo tên)
    const existingSupplier = await Supplier.findOne({ name });
    if (existingSupplier) {
      return res.status(400).json({ error: "Nhà cung cấp đã tồn tại" });
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    if (contact) {
      const existingContact = await Supplier.findOne({ contact });
      if (existingContact) {
        return res.status(400).json({ error: "Số điện thoại đã tồn tại" });
      }
      // Kiểm tra số điện thoại hợp lệ (chỉ chứa số, độ dài từ 10-15 số)
      if (!/^\d{10,15}$/.test(contact)) {
        return res
          .status(400)
          .json({ error: "Số điện thoại phải chứa 10 - 15 chữ số" });
      }
    }

    // Kiểm tra email đã tồn tại chưa
    if (email) {
      const existingEmail = await Supplier.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: "Email đã tồn tại" });
      }
      // Kiểm tra email hợp lệ
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
    }

    // Tạo mới nhà cung cấp
    const newSupplier = new Supplier(req.body);
    await newSupplier.save();

    res.status(201).json(newSupplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Cập nhật thông tin nhà cung cấp
exports.updateSupplier = async (req, res) => {
  try {
    const { name, contact, email, status } = req.body;
    const supplierId = req.params.id;

    // Kiểm tra nhà cung cấp có tồn tại không
    const existingSupplier = await Supplier.findById(supplierId);
    if (!existingSupplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    // Kiểm tra nếu name đã tồn tại trong database (ngoại trừ chính supplier đang cập nhật)
    if (name) {
      const duplicateName = await Supplier.findOne({
        name,
        _id: { $ne: supplierId },
      });
      if (duplicateName) {
        return res.status(400).json({ error: "Supplier name already exists" });
      }
    }

    // Kiểm tra nếu số điện thoại đã tồn tại trong database (ngoại trừ chính supplier đang cập nhật)
    if (contact) {
      const duplicateContact = await Supplier.findOne({
        contact,
        _id: { $ne: supplierId },
      });
      if (duplicateContact) {
        return res.status(400).json({ error: "Contact number already exists" });
      }
      // Kiểm tra số điện thoại hợp lệ (10-15 chữ số)
      if (!/^\d{10,15}$/.test(contact)) {
        return res.status(400).json({ error: "Invalid contact number format" });
      }
    }

    // Kiểm tra nếu email đã tồn tại trong database (ngoại trừ chính supplier đang cập nhật)
    if (email) {
      const duplicateEmail = await Supplier.findOne({
        email,
        _id: { $ne: supplierId },
      });
      if (duplicateEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      // Kiểm tra email hợp lệ
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
    }

    // Cập nhật nhà cung cấp
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedSupplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
// Thay đổi trạng thái suppliersupplier
exports.inactiveSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    supplier.status = status;
    await supplier.save();
    res
      .status(200)
      .json({ message: "User status changed successfully", supplier });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin chi tiết nhà cung cấp kèm danh sách sản phẩm
exports.getSupplierWithProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeInactive = false } = req.query;

    // Lấy thông tin nhà cung cấp
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Lấy danh sách sản phẩm của nhà cung cấp
    const matchCondition =
      includeInactive === "true" ? {} : { status: "active" };

    const supplierProducts = await SupplierProduct.find({
      supplier: id,
    }).populate({
      path: "product",
      match: matchCondition,
      populate: {
        path: "categoryId",
        model: "Category",
        select: "categoryName",
      },
    });

    // Lọc bỏ những document có product null
    const validProducts = supplierProducts.filter((sp) => sp.product !== null);

    // Tính toán thống kê
    const stats = {
      totalProducts: validProducts.length,
      totalStock: validProducts.reduce((sum, sp) => sum + sp.stock, 0),
      avgPrice:
        validProducts.length > 0
          ? validProducts.reduce((sum, sp) => sum + sp.price, 0) /
            validProducts.length
          : 0,
      totalValue: validProducts.reduce(
        (sum, sp) => sum + sp.price * sp.stock,
        0
      ),
    };

    const responseData = {
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        status: supplier.status,
        address: supplier.address,
        createdAt: supplier.createdAt,
        updatedAt: supplier.updatedAt,
      },
      products: validProducts.map((sp) => ({
        supplierProductId: sp._id,
        productId: sp.product._id,
        productName: sp.product.productName,
        productDescription: sp.product.description,
        price: sp.price,
        stock: sp.stock,
        expiry: sp.expiry,
        categoryId: sp.product.categoryId?._id,
        categoryName: sp.product.categoryId?.categoryName || "Chưa phân loại",
        status: sp.product.status,
        createdAt: sp.createdAt,
        updatedAt: sp.updatedAt,
      })),
      stats: stats,
    };

    res.json(responseData);
  } catch (err) {
    console.error("Error getting supplier with products:", err);
    res.status(500).json({ error: "Server error" });
  }
};
