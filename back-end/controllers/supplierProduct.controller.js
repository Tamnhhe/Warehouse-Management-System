const mongoose = require("mongoose");
const db = require("../models");
const SupplierProduct = db.SupplierProduct;

// Lấy sản phẩm theo nhà cung cấp, tính tổng tồn kho và giá trung bình
const getProductsBySupplier = async (req, res) => {
  try {
    const { supplierId, productId } = req.params;
    if (!supplierId) {
      return res.status(400).json({ message: "Thiếu thông tin nhà cung cấp." });
    }
    const filter = { supplier: supplierId };
    if (productId) filter.product = productId;

    // Lấy tất cả các dòng nhập còn tồn kho
    const supplierProducts = await SupplierProduct.find(filter).populate({
      path: "product",
      populate: {
        path: "categoryId",
        select: "categoryName",
      },
    });

    if (!supplierProducts || supplierProducts.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm nào." });
    }

    // Gom nhóm theo sản phẩm để tính tổng tồn kho và giá TB
    const groupedData = {};
    supplierProducts.forEach((entry) => {
      const prodId = entry.product?._id?.toString();
      if (!groupedData[prodId]) {
        groupedData[prodId] = {
          product: entry.product,
          totalStock: 0,
          totalValue: 0,
          status: entry.product?.status || "inactive",
        };
      }
      const stock = Number(entry.stock);
      const price = Number(entry.price);
      if (stock > 0 && price > 0) {
        groupedData[prodId].totalStock += stock;
        groupedData[prodId].totalValue += price * stock;
      }
    });

    const result = Object.values(groupedData)
      .filter(({ totalStock }) => totalStock > 0)
      .map(({ product, totalStock, totalValue, status }) => ({
        productId: product?._id || null,
        productName: product?.productName || "Không rõ tên",
        averagePrice: totalStock > 0 ? Math.floor(totalValue / totalStock) : 0,
        totalStock,
        categoryId: product?.categoryId || null,
        status,
      }));

    return res.json(result);
  } catch (err) {
    console.error("Lỗi getProductsBySupplier:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Lấy toàn bộ danh sách sản phẩm nhà cung cấp (không gom nhóm)
const getAllSupplierProducts = async (req, res) => {
  try {
    const products = await SupplierProduct.find()
      .populate({
        path: "product",
        populate: [
          { path: "categoryId", select: "categoryName" },
          { path: "supplierId", select: "name" },
        ],
      })
      .populate("supplier");

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Không có sản phẩm nào." });
    }

    return res.json(products);
  } catch (err) {
    console.error("Lỗi getAllSupplierProducts:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Nhập hàng vào kho (cộng dồn và tính lại giá TB)
const addSupplierProductEntry = async (req, res) => {
  try {
    const { supplier, product, price, stock, expiry, totalPrice } = req.body;
    if (!supplier || !product || stock == null) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    // Nếu không có price mà có totalPrice thì tự tính lại price
    let finalPrice = price;
    if ((price == null || price === "") && totalPrice != null) {
      finalPrice = Number(stock) > 0 ? Number(totalPrice) / Number(stock) : 0;
    }

    let entry = await SupplierProduct.findOne({ supplier, product });
    if (entry) {
      // Đã có, cộng dồn và tính lại giá TB
      const oldStock = Number(entry.stock);
      const oldPrice = Number(entry.price);
      const newStock = Number(stock);

      // Dùng đúng totalPrice FE gửi lên, không tự nhân lại
      const newTotalValue = totalPrice != null ? Number(totalPrice) : newStock * Number(finalPrice);

      const totalStock = oldStock + newStock;
      const totalValue = oldStock * oldPrice + newTotalValue;
      const avgPrice = totalStock > 0 ? Math.floor(totalValue / totalStock) : 0;

      entry.stock = totalStock;
      entry.price = avgPrice;
      entry.expiry = expiry ? new Date(expiry) : entry.expiry;
      await entry.save();

      return res
        .status(200)
        .json({ message: "Cập nhật nhập hàng thành công.", data: entry });
    } else {
      // Chưa có, tạo mới
      const newEntry = new SupplierProduct({
        supplier,
        product,
        price: finalPrice,
        stock,
        expiry: expiry ? new Date(expiry) : null,
      });
      const saved = await newEntry.save();
      return res
        .status(201)
        .json({ message: "Nhập hàng thành công.", data: saved });
    }
  } catch (err) {
    console.error("Lỗi addSupplierProductEntry:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Xuất hàng theo FIFO (First-In First-Out)
const exportProductFIFO = async (req, res) => {
  try {
    const { supplierId, productId } = req.params;
    const { quantity } = req.body;

    if (!supplierId || !productId || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Thông tin xuất hàng không hợp lệ." });
    }

    // Lấy các lô hàng còn tồn kho theo thứ tự FIFO
    const lots = await SupplierProduct.find({
      supplier: supplierId,
      product: productId,
      stock: { $gt: 0 },
    }).sort({ _id: 1 }); // FIFO: lô nhập trước xuất trước

    const totalStockAvailable = lots.reduce((sum, lot) => sum + lot.stock, 0);
    if (totalStockAvailable < quantity) {
      return res.status(400).json({
        message: `Không đủ hàng để xuất. Chỉ còn ${totalStockAvailable} sản phẩm.`,
      });
    }

    let qtyLeft = quantity;
    let totalCost = 0;
    let totalExported = 0;
    const exportDetails = [];

    for (const lot of lots) {
      if (qtyLeft <= 0) break;

      const canExport = Math.min(lot.stock, qtyLeft);
      totalCost += canExport * lot.price;
      totalExported += canExport;

      exportDetails.push({
        lotId: lot._id,
        exported: canExport,
        pricePerUnit: lot.price,
        expiry: lot.expiry,
      });
      lot.stock -= canExport;

      // Nếu đã hết hàng trong lô này => reset giá
      if (lot.stock === 0) {
        lot.price = 0;
      }

      await lot.save();

      qtyLeft -= canExport;
    }

    return res.status(200).json({
      message: "Xuất hàng thành công.",
      data: {
        totalExported,
        totalCost,
        averageCost:
          totalExported > 0 ? Math.floor(totalCost / totalExported) : 0,
        lotsUsed: exportDetails,
      },
    });
  } catch (err) {
    console.error("Lỗi exportProductFIFO:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Hoàn trả sản phẩm (tạo mới entry hoàn trả)
const returnProducts = async (req, res) => {
  try {
    const { supplierId, productId } = req.params;
    const { returnQuantity, price, expiry } = req.body;

    if (!supplierId || !productId || !returnQuantity || returnQuantity <= 0) {
      return res
        .status(400)
        .json({ message: "Thông tin hoàn trả không hợp lệ." });
    }

    const newEntry = new SupplierProduct({
      supplier: supplierId,
      product: productId,
      price: price || 0,
      stock: returnQuantity,
      expiry: expiry ? new Date(expiry) : null,
    });

    const saved = await newEntry.save();

    return res
      .status(200)
      .json({ message: "Hoàn trả sản phẩm thành công.", data: saved });
  } catch (err) {
    console.error("Lỗi returnProducts:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

module.exports = {
  getProductsBySupplier,
  getAllSupplierProducts,
  addSupplierProductEntry,
  exportProductFIFO,
  returnProducts,
};