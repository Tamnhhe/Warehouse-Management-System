
const db = require("../models/index");
const InventoryTransaction = db.InventoryTransaction;
const User = db.User;
const Product = db.Product;
const Category = db.Category;
const Supplier = db.Supplier;
const SupplierProduct = db.SupplierProduct;
const mongoose = require("mongoose");

// Tạo mới một giao dịch xuất/nhập kho
const createTransaction = async (req, res, next) => {
  //try {
  const {
    supplier,
    transactionType,
    transactionDate,
    products,
    totalPrice,
    status,
    branch,
  } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!products || products.length === 0 || totalPrice == null) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  // Tìm một user với vai trò 'manager'
  const manager = await User.findOne({ role: "manager" });
  if (!manager) {
    return res.status(400).json({ message: "Manager not found." });
  }

  const newTransaction = new InventoryTransaction({
    supplier,
    transactionType,
    transactionDate: transactionDate || Date.now(),
    products,
    operator: manager._id, // Sử dụng ObjectId của manager
    totalPrice,
    status: status || "pending",
    branch,
  });

  await newTransaction.save();

  // Nếu là giao dịch xuất kho, cập nhật tồn kho
if (transactionType === "export") {
  for (const p of products) {
    const supplierProduct = await SupplierProduct.findById(p.supplierProductId).populate("product");

    if (supplierProduct && supplierProduct.product) {
      const productId = supplierProduct.product._id;

      // Trừ đi số lượng hàng xuất
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { totalStock: -p.requestQuantity } }
      );
    }
  }
}
  return res
    .status(201)
    .json({ message: "Giao dịch được tạo thành công", newTransaction });
  // } catch (err) {
  //   console.error("Error creating transaction:", err);
  //   return res.status(500).json({ message: "Failed to create transaction." });
  // }
};

// Lấy tất cả giao dịch xuất/nhập kho
// const getAllTransactions = async (req, res) => {
//   try {
//     const transactions = await InventoryTransaction.find()
//       .populate("products.productId")
//       .populate("operator");
//     res.status(200).json(transactions);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find()
      .populate("supplier", "name") // Lấy TÊN thay vì chỉ ID
      .sort({ transactionDate: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách giao dịch:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Lấy một giao dịch theo ID
const getTransactionById = async (req, res) => {
  try {
    const transaction = await InventoryTransaction.findById(req.params.id)
      .populate({
        path: "products.supplierProductId",
        model: "SupplierProduct",
        populate: {
          path: "product",
          model: "Product",
          select: "productName",
        },
      })
      .populate("operator");

    console.log(" API DATA:", JSON.stringify(transaction, null, 2));

    if (!transaction) {
      return res.status(404).json({ message: "Giao dịch không tồn tại" });
    }

    console.log(" API sau khi populate:", JSON.stringify(transaction, null, 2));

    res.status(200).json(transaction);
  } catch (error) {
    console.error(" Lỗi khi lấy giao dịch:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transactionId = req.params.id;

    console.log("Cập nhật trạng thái:", transactionId, status);

    const updatedTransaction1 = await InventoryTransaction.findByIdAndUpdate(
      transactionId,
      { status },
      { new: true }
    );

    if (!updatedTransaction1) {
      return res.status(404).json({ message: "Giao dịch không tồn tại!" });
    }

    res.json(updatedTransaction1);
  } catch (error) {
    console.error("Lỗi khi cập nhật giao dịch:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { products } = req.body;

    console.log("ID giao dịch:", id);
    console.log("Dữ liệu sản phẩm cần cập nhật:", req.body);

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID giao dịch không hợp lệ" });
    }

    // Kiểm tra xem giao dịch có tồn tại không
    const transaction = await InventoryTransaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Giao dịch không tồn tại" });
    }

    // Lặp qua từng sản phẩm để cập nhật
    let updateFields = {};
    let arrayFilters = [];

    products.forEach((product) => {
      if (
        !product.supplierProductId ||
        product.supplierProductId.length !== 24
      ) {
        console.warn(
          `⚠️ Cảnh báo: sản phẩm ${product._id} thiếu supplierProductId`
        );
        return;
      }

      // Chuyển đổi supplierProductId thành ObjectId
      const supplierProductObjectId = new mongoose.Types.ObjectId(
        product.supplierProductId
      );

      // Cập nhật dữ liệu sản phẩm
      updateFields[`products.$[elem].requestQuantity`] =
        product.requestQuantity;
      updateFields[`products.$[elem].receiveQuantity`] =
        product.receiveQuantity;
      updateFields[`products.$[elem].defectiveProduct`] =
        product.defectiveProduct;
      updateFields[`products.$[elem].achievedProduct`] =
        product.achievedProduct;
      updateFields[`products.$[elem].price`] = product.price;
      updateFields[`products.$[elem].expiry`] = product.expiry;

      // Điều kiện lọc sản phẩm trong `arrayFilters`
      arrayFilters.push({ "elem.supplierProductId": supplierProductObjectId });
    });

    // Nếu không có sản phẩm hợp lệ, trả về lỗi
    if (arrayFilters.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm hợp lệ để cập nhật" });
    }

    // Tính tổng giá tiền (price * achievedProduct)
    const totalPrice = products.reduce(
      (sum, product) => sum + product.achievedProduct * product.price,
      0
    );

    // Cập nhật transaction trong database
    const updatedTransaction = await InventoryTransaction.findOneAndUpdate(
      { _id: id },
      { $set: { ...updateFields, totalPrice } }, // Thêm totalPrice vào cập nhật
      { arrayFilters, new: true }
    );

    // Kiểm tra xem cập nhật có thành công không
    if (!updatedTransaction) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }

    console.log("Giao dịch sau cập nhật:", updatedTransaction);
    res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm trong giao dịch:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};

const createReceipt = async (req, res) => {
  try {
    const { supplierName, products } = req.body;

    // Validate required fields
    if (
      !supplierName ||
      !products ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or invalid data format",
      });
    }

    // Find supplier by name
    const supplierDoc = await Supplier.findOne({
      name: { $regex: new RegExp(`^${supplierName}$`, "i") },
    });

    if (!supplierDoc) {
      return res.status(400).json({
        success: false,
        message: "Supplier not found in system",
      });
    }

    // Process each product
    const processedProducts = [];
    for (const product of products) {
      try {
        // Validate required product fields
        if (
          !product.productName ||
          !product.categoryName ||
          !product.quantity ||
          !product.price
        ) {
          throw new Error(
            `Missing required fields for product ${
              product.productName || "unknown"
            }`
          );
        }

        // Find category in system
        const category = await Category.findOne({
          categoryName: {
            $regex: new RegExp(`^${product.categoryName}$`, "i"),
          },
        });

        if (!category) {
          throw new Error(
            `Category ${product.categoryName} not found in system`
          );
        }

        // Find product in system
        const productDoc = await Product.findOne({
          productName: { $regex: new RegExp(`^${product.productName}$`, "i") },
        });

        if (!productDoc) {
          throw new Error(`Product ${product.productName} not found in system`);
        }

        // Handle SupplierProduct relationship
        let supplierProduct = await SupplierProduct.findOne({
          product: productDoc._id,
          supplier: supplierDoc._id,
        });

        if (supplierProduct) {
          // Update existing supplier product
          supplierProduct = await SupplierProduct.findByIdAndUpdate(
            supplierProduct._id,
            {
              price: product.price,
              stock: supplierProduct.stock + Number(product.quantity),
            },
            { new: true }
          );
        } else {
          // Create new supplier product relationship
          supplierProduct = await SupplierProduct.create({
            product: productDoc._id,
            supplier: supplierDoc._id,
            price: product.price,
            stock: product.quantity,
          });
        }

        // Add to processed products array
        processedProducts.push({
          supplierProductId: supplierProduct._id,
          requestQuantity: Number(product.quantity),
          receiveQuantity: Number(product.quantity),
          defectiveProduct: 0,
          achievedProduct: Number(product.quantity),
          price: Number(product.price),
        });
      } catch (error) {
        console.error(`Error processing product:`, error);
        throw new Error(error.message);
      }
    }

    // Calculate total price
    const totalPrice = processedProducts.reduce((sum, product) => {
      return sum + product.price * product.requestQuantity;
    }, 0);

    // Create inventory transaction
    const receipt = await InventoryTransaction.create({
      transactionType: "import",
      transactionDate: new Date(), // Ngày nhập
      products: processedProducts,
      supplier: supplierDoc._id, // ID nhà cung cấp
      supplierName: supplierDoc.name, // Tên nhà cung cấp
      totalPrice,
      status: "pending", // Trạng thái mặc định là pending
      branch: "Main Branch",
    });

    // Update product stock
    for (const product of processedProducts) {
      const supplierProduct = await SupplierProduct.findById(
        product.supplierProductId
      );
      await Product.findByIdAndUpdate(supplierProduct.product, {
        $inc: { totalStock: product.receiveQuantity },
      });
    }

    res.status(201).json({
      success: true,
      message: "Receipt created successfully",
      data: receipt,
    });
  } catch (error) {
    console.error("Error creating receipt:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  createReceipt,
  updateTransaction,
  updateTransactionStatus,
};
