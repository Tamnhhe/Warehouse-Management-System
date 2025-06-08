const db = require("../models/index");
const mongoose = require("mongoose");

const SupplierProduct = db.SupplierProduct;

// Lấy danh sách sản phẩm theo nhà cung cấp
const getProductsBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    console.log("Received supplierId:", supplierId, typeof supplierId);

    if (!supplier) {
      return res.status(400).json({ message: "Nhà cung cấp không hợp lệ." });
    }

    const supplierObjectId = new mongoose.Types.ObjectId(supplierId);
    console.log("Converted supplierId:", supplierObjectId);

    const products = await SupplierProduct.find({
      supplier: supplierObjectId,
    }).populate({
      path: "product",
      populate: {
        path: "categoryId",
        model: "Category",
        select: "categoryName",
      },
    });

    console.log("Products found:", products);

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm nào cho nhà cung cấp này." });
    }

    return res.json(
      products.map((sp) => ({
        productId: sp.product?._id || null,
        productName: sp.product?.productName || "Không có tên",
        price: sp.price,
        categoryId: sp.product?.categoryId || null,
        status: sp.product?.status || "inactive",    
      }))
    );
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo nhà cung cấp:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};
const getAllSupplierProducts = async (req, res) => {
  try {
    const supplierProducts = await db.SupplierProduct.find()
      .populate("product")
      .populate("supplier");

    console.log("supplierProducts:", supplierProducts);
    //console.log("supplierProducts.length:", supplierProducts.length);

    if (!supplierProducts || supplierProducts.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm nào." });
    }

    res.json(supplierProducts);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

module.exports = { getAllSupplierProducts, getProductsBySupplier };
