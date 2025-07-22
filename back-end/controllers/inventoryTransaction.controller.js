const db = require("../models/index");
const mongoose = require("mongoose");

// Lấy tất cả giao dịch xuất/nhập kho
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await db.InventoryTransaction.find()
      .populate("supplier", "name") // Lấy TÊN thay vì chỉ ID
      .populate("branch", "name receiver address phone email") // Populate thông tin branch
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
    // Lấy giao dịch và populate supplierProductId, productId, operator và branch
    const transaction = await db.InventoryTransaction.findById(req.params.id)
      .populate({
        path: "products.supplierProductId",
        model: "SupplierProduct",
      })
      .populate({
        path: "products.productId",
        model: "Product",
        strictPopulate: false, // Cho phép populate trường không có trong schema
      })
      .populate("operator")
      .populate("branch", "name receiver address phone email"); // Populate thông tin branch

    if (!transaction) {
      return res.status(404).json({ message: "Giao dịch không tồn tại" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    console.error(" Lỗi khi lấy giao dịch:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Tạo mới một giao dịch xuất/nhập kho
const createTransaction = async (req, res, next) => {
  try {
    const {
      supplier,
      transactionType,
      transactionDate,
      products,
      totalPrice,
      branch,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
    }

    // Kiểm tra thông tin branch cho giao dịch xuất kho
    if (transactionType === "export" && !branch) {
      return res.status(400).json({
        message: "Thông tin chi nhánh là bắt buộc cho giao dịch xuất kho",
      });
    }

    // Validate branch nếu được cung cấp
    let validatedBranch = null;
    if (branch) {
      validatedBranch = await db.Branch.findById(branch);
      if (!validatedBranch) {
        return res.status(400).json({
          message: "Chi nhánh không tồn tại trong hệ thống",
        });
      }
    }

    // Tính toán tổng tiền nếu không được cung cấp (cho trường hợp xuất kho)
    let calculatedTotalPrice = totalPrice;
    if (calculatedTotalPrice == null && transactionType === "export") {
      // Đối với xuất kho, không cần tính giá tiền
      calculatedTotalPrice = 0;
    }

    // Tìm một user với vai trò 'manager'
    const manager = await db.User.findOne({ role: "manager" });
    if (!manager) {
      return res.status(400).json({ message: "Manager not found." });
    }

    // Tìm một supplier mặc định nếu không được cung cấp
    let transactionSupplier = supplier;
    if (!transactionSupplier) {
      const defaultSupplier = await db.Supplier.findOne();
      if (!defaultSupplier) {
        return res
          .status(400)
          .json({ message: "Cần ít nhất một nhà cung cấp trong hệ thống." });
      }
      transactionSupplier = defaultSupplier._id;
    }

    // Xử lý sản phẩm và chuyển đổi productId thành supplierProductId
    const processedProducts = [];
    for (const item of products) {
      try {
        // Trường hợp gửi lên productId thay vì supplierProductId
        if (item.productId && !item.supplierProductId) {
          // Tìm sản phẩm
          const product = await db.Product.findById(item.productId);
          if (!product) {
            console.error(`Không tìm thấy sản phẩm với ID: ${item.productId}`);
            continue;
          }

          // Tìm hoặc tạo mới supplier product
          let supplierProduct = await db.SupplierProduct.findOne({
            productName: product.productName,
          });

          if (!supplierProduct) {
            // Tạo mới một supplier product liên kết đến sản phẩm này
            supplierProduct = new db.SupplierProduct({
              supplier: transactionSupplier,
              productName: product.productName,
              stock: 0, // Không cần có stock
              productImage: product.productImage || "",
              categoryId: product.categoryId,
              quantitative: product.quantitative || 1,
              unit: product.unit || "cái",
            });

            await supplierProduct.save();
          }

          processedProducts.push({
            supplierProductId: supplierProduct._id,
            productId: product._id, // Lưu cả productId để dễ truy xuất thông tin sản phẩm
            requestQuantity: parseInt(item.requestQuantity) || 1,
            receiveQuantity: parseInt(item.requestQuantity) || 1,
            defectiveProduct: 0,
            achievedProduct: parseInt(item.requestQuantity) || 1,
            price: 0,
          });
        } else if (item.supplierProductId) {
          // Trường hợp đã có supplierProductId
          processedProducts.push(item);
        }
      } catch (error) {
        console.error("Lỗi xử lý sản phẩm:", error);
      }
    }

    // Kiểm tra nếu không có sản phẩm nào hợp lệ
    if (processedProducts.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm nào hợp lệ để xử lý" });
    }

    // Lấy thông tin branch chi tiết nếu có
    let branchInfo = {};
    if (validatedBranch) {
      branchInfo = {
        branch: validatedBranch._id,
        branchName: validatedBranch.name,
        branchReceiver: validatedBranch.receiver,
        branchAddress: validatedBranch.address,
        branchPhone: validatedBranch.phone,
        branchEmail: validatedBranch.email,
      };
    }

    const newTransaction = new db.InventoryTransaction({
      supplier: transactionSupplier,
      transactionType,
      transactionDate: transactionDate || Date.now(),
      products: processedProducts,
      operator: manager._id,
      totalPrice: calculatedTotalPrice,
      status: "pending",
      ...branchInfo,
    });

    const savedTransaction = await newTransaction.save();

    return res.status(201).json({
      message: "Giao dịch được tạo thành công",
      newTransaction: savedTransaction,
    });
  } catch (err) {
    console.error("Error creating transaction:", err);
    return res
      .status(500)
      .json({ message: "Failed to create transaction: " + err.message });
  }
};


const createReceipt = async (req, res) => {
  try {
    const { supplierName, products } = req.body;

    // Validate required fields
    if (!supplierName || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or invalid data format",
      });
    }

    // Find supplier by name
    const supplierDoc = await db.Supplier.findOne({
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
        if (!product.productName || !product.categoryName || !product.quantity || !product.price) {
          throw new Error(
            `Missing required fields for product ${
              product.productName || "unknown"
            }`
          );
        }

        // Find category in system
        const category = await db.Category.findOne({
          categoryName: {
            $regex: new RegExp(`^${product.categoryName}$`, "i"),
          },
        });

        if (!category) {
          res.status(400).json({ message: `Category ${product.categoryName} not found` });
        }

        // Find SupplierProduct relationship (no update, just find or create)
        let supplierProduct = await db.SupplierProduct.findOne({
          productName: product.productName,
          supplier: supplierDoc._id,
        });

        if (!supplierProduct) {
          res.status(400).json({ message: `Supplier product not found for ${product.productName}` });
        }

        // Add to processed products array for inventory transaction
        processedProducts.push({
          supplierProductId: supplierProduct._id,
          requestQuantity: Number(product.quantity),
          receiveQuantity: Number(product.quantity),
          defectiveProduct: 0,
          achievedProduct: Number(product.quantity),
          price: Number(product.price),
          quantitative: Number(supplierProduct.quantitative) || 0,
          expiry: supplierProduct.expiry || null,
        });
      } catch (error) {
        throw error;
      }
    }

    // Calculate total price
    const totalPrice = processedProducts.reduce((sum, product) => {
      return sum + product.price * product.requestQuantity;
    }, 0);

    // Create inventory transaction
    const receipt = await db.InventoryTransaction.create({
      transactionType: "import",
      transactionDate: new Date(),
      products: processedProducts,
      supplier: supplierDoc._id,
      supplierName: supplierDoc.name,
      totalPrice,
      status: "pending",
    });

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



const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transactionId = req.params.id;

    const transaction = await db.InventoryTransaction.findById(transactionId)
      .populate({
        path: "products.supplierProductId",
        model: "SupplierProduct",
      })
      .populate("operator");

    if (!transaction) {
      return res.status(404).json({ message: "Giao dịch không tồn tại!" });
    }

    // Extract products from the transaction
    const products = transaction.products.map((p) => ({
      supplierProductId: p.supplierProductId._id,
      requestQuantity: p.requestQuantity,
      receiveQuantity: p.receiveQuantity,
      defectiveProduct: p.defectiveProduct,
      achievedProduct: p.achievedProduct,
      price: p.price,
      expiry: p.supplierProductId.expiry || p.expiry || null,
      quantity: p.supplierProductId.quantitative || p.weight || 0,
    }));

    // Update product and choose inventory is best match to update product into inventory when status is 'completed' and transaction type is 'import'
    if (status === "completed" && transaction.transactionType === "import") {
      for (const product of products) {
        const supplierProduct = await db.SupplierProduct.findById(
          product.supplierProductId
        );

        if (!supplierProduct) {
          res
            .status(404)
            .json("Supplier product not found:", product.supplierProductId); // Log the missing supplier product
          continue;
        }

        // Tìm sản phẩm trong hệ thống
        const dbProduct = await db.Product.findOne({
          productName: supplierProduct.productName,
        });

        if (!dbProduct) {
          res.status(404).json({ message: `Product: ${supplierProduct.productName} not found` });
        }

        // Cập nhật tổng tồn kho của sản phẩm
        const updatedProduct = await db.Product.findByIdAndUpdate(
          dbProduct._id,
          { $inc: { totalStock: product.achievedProduct } },
          { new: true }
        );

        // Phân bổ sản phẩm vào các kệ theo thứ tự ưu tiên và giới hạn dung lượng
        await distributeProductToInventories(
          updatedProduct,
          product
        );
      }
    }

    // Update product and supplier product when status is 'completed' and transaction type is 'export'
    if (status === "completed" && transaction.transactionType === "export") {
      for (const product of products) {
        const supplierProduct = await db.SupplierProduct.findById(
          product.supplierProductId
        );

        if (!supplierProduct) {
          res
            .status(404)
            .json("Supplier product not found:", product.supplierProductId);
          continue;
        }

        // Tìm sản phẩm trong hệ thống
        const dbProduct = await db.Product.findOne({
          productName: supplierProduct.productName,
        });

        if (!dbProduct) {
          res.status(404).json({ message: `Product: ${supplierProduct.productName} not found` });
        }

        dbProduct.totalStock -= product.receiveQuantity;

        // Cập nhật tổng tồn kho của sản phẩm
        const updatedProduct = await db.Product.findByIdAndUpdate(
          dbProduct._id,
          { $inc: { totalStock: -product.receiveQuantity } },
          { new: true }
        );

        // Giảm số lượng sản phẩm từ các kệ theo thứ tự FIFO
        await removeProductFromInventories(
          updatedProduct._id,
          product.receiveQuantity
        );
      }
    }

    const updatedTransaction = await db.InventoryTransaction.findByIdAndUpdate(
      transactionId,
      { status },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Giao dịch không tồn tại!" });
    }

    res.json(updatedTransaction);
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
    const transaction = await db.InventoryTransaction.findById(id);
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
    const updatedTransaction = await db.InventoryTransaction.findOneAndUpdate(
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



// Hàm phân bổ sản phẩm vào các kệ
async function distributeProductToInventories(product, productData) {
  try {
    // Lấy tất cả kệ có dung lượng còn trống bằng cách trừ maxQuantitative - currentQuantitative
    const inventories = await db.Inventory.find({
      categoryId: product.categoryId
    }).sort({ createdAt: 1 }); // Sắp xếp theo FIFO (có thể dùng createdAt hoặc priority)

    let remainingQuantitativeToDistribute = productData.achievedProduct * product.quantitative || 0;

    const totalInventoryRemainingSpace = inventories.reduce((total, inventory) => {
      return total + (inventory.maxQuantitative - inventory.currentQuantitative);
    }, 0);
    if (totalInventoryRemainingSpace < remainingQuantitativeToDistribute) {
      throw new Error(`Không đủ dung lượng trong các kệ để phân bổ ${remainingQuantitativeToDistribute} đơn vị.`);
    }

    // Phân bổ sản phẩm vào các kệ theo thứ tự
    for (const inventory of inventories) {
      if (remainingQuantitativeToDistribute <= 0) break;

      // Tính số lượng có thể phân bổ vào kệ này
      const availableSpace = inventory.maxQuantitative - inventory.currentQuantitative;
      const quantityToAllocate = Math.min(availableSpace, remainingQuantitativeToDistribute);

      if (quantityToAllocate > 0) {
        // Cập nhật sản phẩm trong kệ
        const productIndex = inventory.products.findIndex(
          (p) => p.productId.toString() === product._id.toString()
        );

        if (productIndex !== -1) {
          inventory.products[productIndex].quantity += quantityToAllocate;
        } else {
          // Thêm sản phẩm mới vào kệ
          inventory.products.push({
            productId: product._id,
            quantity: productData.achievedProduct,
            expiry: productData.expiry || null,
            quantitative: productData.quantitative || 0,
            price: productData.price || 0,
          });
        }

        // Cập nhật trọng lượng và số lượng hiện tại của kệ
        inventory.currentQuantitative += quantityToAllocate * (productData.quantitative || 1);
        console.log("Updated inventory:", inventory);
        await inventory.save();

        //Update product location too
        const updatedProduct = await db.Product.findById(product._id);
        const newLocation = [{
          inventoryId: inventory._id,
          stock: productData.achievedProduct,
          price: productData.price || 0,
        }];

        const existedlocation = updatedProduct.location.find(loc => loc.inventoryId.toString() === inventory._id.toString());
        if (!existedlocation) {
          updatedProduct.location.push(...newLocation);
        } else {
          updatedProduct.location.map(loc => {
          if (loc.inventoryId.toString() === inventory._id.toString()) {
            loc.price = (loc.price * loc.stock + productData.price * productData.achievedProduct) / (loc.stock + productData.achievedProduct) || 0;
            loc.stock += productData.achievedProduct;
          }
        });
        }
        await updatedProduct.save();
        remainingQuantitativeToDistribute -= quantityToAllocate;
      }
    }
  } catch (err) {
    console.error("Lỗi khi phân bổ sản phẩm vào kệ:", err);
    throw new Error("Lỗi khi phân bổ sản phẩm vào kệ: " + err.message);
  }
}

// Hàm loại bỏ sản phẩm từ các kệ (xuất kho)
async function removeProductFromInventories(productId, quantity) {
  try {
    // Lấy tất cả kệ có chứa sản phẩm này, sắp xếp theo FIFO (có thể dùng createdAt hoặc priority)
    const inventories = await db.Inventory.find({
      "products.productId": productId,
    }).sort({ createdAt: 1 }); // FIFO: First In First Out

    if (inventories.length === 0) {
      console.log(`Không tìm thấy kệ chứa sản phẩm ${productId}`);
      return;
    }

    let remainingQuantityToRemove = quantity;

    // Lấy sản phẩm từ các kệ theo thứ tự
    for (const inventory of inventories) {
      if (remainingQuantityToRemove <= 0) break;

      // Tìm sản phẩm trong kệ
      const productIndex = inventory.products.findIndex(
        (p) => p.productId.toString() === productId.toString()
      );

      if (productIndex !== -1) {
        const currentQuantity = inventory.products[productIndex].quantity;
        const quantityToRemove = Math.min(
          currentQuantity,
          remainingQuantityToRemove
        );

        if (quantityToRemove > 0) {
          // Tính trọng lượng tương ứng cần giảm
          const product = await db.Product.findById(productId);
          const weightPerUnit = product.quantitative || 0;
          const weightToRemove = quantityToRemove * weightPerUnit;

          // Cập nhật số lượng sản phẩm trong kệ
          inventory.products[productIndex].quantity -= quantityToRemove;

          // Cập nhật số lượng và trọng lượng hiện tại của kệ
          inventory.currentQuantitative -= quantityToRemove;
          inventory.currentWeight -= weightToRemove;

          // Nếu số lượng sản phẩm trong kệ bằng 0, xóa khỏi danh sách
          if (inventory.products[productIndex].quantity <= 0) {
            inventory.products.splice(productIndex, 1);
          }

          await inventory.save();
          remainingQuantityToRemove -= quantityToRemove;
        }
      }
    }

    // Nếu không tìm đủ sản phẩm để loại bỏ
    if (remainingQuantityToRemove > 0) {
      console.log(
        `Không đủ sản phẩm ${productId} trong kệ để xuất ${remainingQuantityToRemove} đơn vị`
      );
    }
  } catch (err) {
    console.error("Lỗi khi loại bỏ sản phẩm từ kệ:", err);
  }
}

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  createReceipt,
  updateTransaction,
  updateTransactionStatus,
};
