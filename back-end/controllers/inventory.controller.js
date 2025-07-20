const Inventory = require("../models/inventory.model");
const Product = require("../models/product.model");

const createTransaction = async (req, res, next) => {
  const {
    supplier,
    transactionType,
    transactionDate,
    products,
    totalPrice,
    status,
    branch,
  } = req.body;

  // Tự động lấy productId nếu chỉ có productName
  for (const item of products) {
    if (!item.productId && item.productName) {
      const productDoc = await Product.findOne({
        productName: item.productName,
      });
      if (productDoc) {
        item.productId = productDoc._id;
      } else {
        return res
          .status(400)
          .json({ message: `Không tìm thấy sản phẩm: ${item.productName}` });
      }
    }
  }

  // ...phần còn lại giữ nguyên...
  const manager = await User.findOne({ role: "manager" });
  if (!manager) {
    return res.status(400).json({ message: "Manager not found." });
  }

  const newTransaction = new InventoryTransaction({
    supplier,
    transactionType,
    transactionDate: transactionDate || Date.now(),
    products,
    operator: manager._id,
    totalPrice,
    status: status || "pending",
    branch,
  });

  await newTransaction.save();

  // Nếu là xuất kho thì trừ hàng luôn (nếu muốn)
  if (transactionType === "export") {
    const { deductProductsFromInventories } = require("./inventory.controller");
    await deductProductsFromInventories(products);
  }

  return res
    .status(201)
    .json({ message: "Giao dịch được tạo thành công", newTransaction });
};

exports.distributeProductsToInventories = async (products) => {
  for (const item of products) {
    let productId =
      item.productId || item.supplierProductId?.product || item.product;
    let quantity =
      item.achievedProduct || item.requestQuantity || item.quantity;

    let productDoc = await Product.findById(productId);
    let categoryId = item.categoryId || productDoc?.categoryId;

    if (!productId || !categoryId || !quantity) continue;

    let inventories = await Inventory.find({
      categoryId,
      status: "active",
      $expr: { $lt: ["$currentQuantitative", "$maxQuantitative"] },
    }).sort({ createdAt: 1 });

    let remain = quantity;
    for (let inv of inventories) {
      let available = inv.maxQuantitative - inv.currentQuantitative;
      let addQty = Math.min(remain, available);

      if (addQty > 0) {
        // Tìm sản phẩm trong kệ
        let prodObj = inv.products.find((p) => p.productId.equals(productId));
        if (prodObj) {
          prodObj.quantity += addQty;
        } else {
          inv.products.push({ productId, quantity: addQty });
        }
        inv.currentQuantitative += addQty;
        await inv.save();
        remain -= addQty;
      }
      if (remain <= 0) break;
    }
    if (remain > 0) {
      console.log(
        `Còn dư ${remain} sản phẩm ${productId} chưa phân bổ được vào kệ nào!`
      );
    }
  }
};

async function autoDeductProductsFromInventories(products) {
  for (const p of products) {
    let quantityToDeduct = p.requestQuantity;
    // Tìm tất cả inventory có chứa sản phẩm này, ưu tiên kệ có nhiều hàng trước
    const inventories = await Inventory.find({
      "products.productId": p.productId,
    }).sort({ "products.quantity": -1 });
    for (const inv of inventories) {
      if (quantityToDeduct <= 0) break;
      // Tìm đúng object sản phẩm trong kệ
      let prodObj = inv.products.find((obj) =>
        obj.productId.equals(p.productId)
      );
      if (!prodObj || prodObj.quantity <= 0) continue;
      const deduct = Math.min(prodObj.quantity, quantityToDeduct);
      prodObj.quantity -= deduct;
      inv.currentQuantitative -= deduct;
      quantityToDeduct -= deduct;
      await inv.save();
    }
    if (quantityToDeduct > 0) {
      throw new Error(`Không đủ hàng trong kho cho sản phẩm ${p.productId}`);
    }
    // Trừ tổng tồn kho sản phẩm
    await Product.findByIdAndUpdate(p.productId, {
      $inc: { totalStock: -p.requestQuantity },
    });
  }
}
exports.autoDeductProductsFromInventories = autoDeductProductsFromInventories;
// Nhập hàng tự động phân bổ vào nhiều kệ đúng loại sản phẩm
exports.importProductAutoDistribute = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin hoặc số lượng không hợp lệ" });
    }

    // Lấy sản phẩm để biết categoryId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    const categoryId = product.categoryId;

    let remain = quantity;
    let distributed = [];

    // 1. 优先考虑已经有该产品的货架（按优先级排序）
    let inventoriesWithProduct = await Inventory.find({
      categoryId,
      "products.productId": productId,
      status: "active",
    }).sort({ priority: 1, createdAt: 1 });

    // 2. 处理已有产品的货架
    for (let inventory of inventoriesWithProduct) {
      if (remain <= 0) break;

      if (inventory.currentQuantitative >= inventory.maxQuantitative) continue;

      let available = inventory.maxQuantitative - inventory.currentQuantitative;
      let addQty = Math.min(remain, available);

      if (addQty > 0) {
        // 找到该产品在货架中的记录
        const productInShelf = inventory.products.find(
          (p) => p.productId.toString() === productId
        );

        // 更新产品数量
        productInShelf.quantity += addQty;
        inventory.currentQuantitative += addQty;
        await inventory.save();

        // 更新产品的location记录
        const locationInProduct = product.location.find(
          (loc) => loc.inventoryId.toString() === inventory._id.toString()
        );

        if (locationInProduct) {
          locationInProduct.stock += addQty;
        } else {
          product.location.push({
            inventoryId: inventory._id,
            stock: addQty,
          });
        }

        distributed.push({ inventoryId: inventory._id, added: addQty });
        remain -= addQty;
      }
    }

    // 3. 如果还有剩余，考虑同类别的空货架
    if (remain > 0) {
      let emptyInventories = await Inventory.find({
        categoryId,
        "products.productId": { $ne: productId },
        status: "active",
      }).sort({ priority: 1, createdAt: 1 });

      for (let inventory of emptyInventories) {
        if (remain <= 0) break;

        if (inventory.currentQuantitative >= inventory.maxQuantitative)
          continue;

        let available =
          inventory.maxQuantitative - inventory.currentQuantitative;
        let addQty = Math.min(remain, available);

        if (addQty > 0) {
          // 添加新产品到货架
          inventory.products.push({ productId, quantity: addQty });
          inventory.currentQuantitative += addQty;
          await inventory.save();

          // 添加新location到产品
          product.location.push({
            inventoryId: inventory._id,
            stock: addQty,
          });

          distributed.push({ inventoryId: inventory._id, added: addQty });
          remain -= addQty;
        }
      }
    }

    // 更新产品总库存并保存
    product.totalStock = (product.totalStock || 0) + (quantity - remain);
    await product.save();

    if (remain > 0) {
      return res.status(200).json({
        message: `Đã phân bổ hết chỗ, còn dư ${remain} sản phẩm chưa được nhập.`,
        distributed,
      });
    }

    res.json({ message: "Nhập hàng và phân bổ thành công!", distributed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// API trả về layout kệ cho sơ đồ kho
exports.getInventoryLayout = async (req, res) => {
  try {
    // 获取所有货架，并填充categoryId和products.productId字段
    const inventories = await Inventory.find()
      .populate("categoryId")
      .populate("products.productId")
      .sort({ createdAt: 1 });

    // 构建返回结果，包含货架上实际存放的产品
    const result = inventories.map((inv) => ({
      _id: inv._id,
      name: inv.name,
      location: inv.location,
      category: inv.categoryId,
      maxQuantitative: inv.maxQuantitative,
      currentQuantitative: inv.currentQuantitative,
      maxWeight: inv.maxWeight,
      currentWeight: inv.currentWeight,
      status: inv.status,
      priority: inv.priority || 0,
      products: inv.products.map((p) => ({
        productId: p.productId._id,
        productName: p.productId.productName || "未知产品",
        quantity: p.quantity,
        unit: p.productId.unit || "",
        totalStock: p.productId.totalStock || 0,
        categoryId: p.productId.categoryId,
        quantitative: p.productId.quantitative || 0,
      })),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Thêm kệ mới
exports.createInventory = async (req, res) => {
  try {
    const { name, location, categoryId, maxQuantitative, maxWeight, status } =
      req.body;
    if (!name || !categoryId || !maxQuantitative || !maxWeight) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    // Kiểm tra nếu đã có kệ cùng tên
    const existingInventory = await Inventory.findOne({ name });
    if (existingInventory) {
      return res
        .status(400)
        .json({ message: "Tên kệ đã tồn tại, vui lòng chọn tên khác!" });
    }
    // Tạo kệ mới với số lượng hiện tại = 0, KHÔNG có trường creator
    const newInventory = new Inventory({
      name,
      location,
      categoryId,
      maxQuantitative,
      maxWeight,
      currentQuantitative: 0,
      currentWeight: 0,
      status: status || "active",
      products: [],
    });
    await newInventory.save();

    // 不再调用redistributeStockForCategory函数
    // 新建的货架应该是空的，不需要自动分配产品

    res.status(201).json({
      message: "Tạo kệ mới thành công!",
      inventory: newInventory,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hàm phân bổ lại tồn kho cho tất cả kệ cùng category, cập nhật cả Product.location
// 修改函数逻辑，只处理指定的产品，不会自动重新分配所有产品
async function redistributeStockForCategory(categoryId, productId = null) {
  // 如果指定了productId，只处理该产品
  if (productId) {
    const product = await Product.findById(productId);
    if (!product) return;

    // 重置该产品的location
    product.location = [];

    // 获取同类别的所有货架，按优先级排序
    const inventories = await Inventory.find({
      categoryId,
      status: "active",
    }).sort({ priority: 1, createdAt: 1 });

    // 从该产品在每个货架上移除
    for (let inv of inventories) {
      inv.products = inv.products.filter((p) => !p.productId.equals(productId));
      inv.currentQuantitative = inv.products.reduce(
        (sum, p) => sum + p.quantity,
        0
      );
      await inv.save();
    }

    // 重新分配该产品
    let remain = product.totalStock;
    for (let inv of inventories) {
      if (remain <= 0) break;

      // 检查货架上是否已有该产品
      let productInShelf = inv.products.find((p) =>
        p.productId.equals(productId)
      );
      if (productInShelf) {
        // 优先考虑已有产品的货架
        let available = inv.maxQuantitative - inv.currentQuantitative;
        let addQty = Math.min(remain, available);

        if (addQty > 0) {
          productInShelf.quantity += addQty;
          inv.currentQuantitative += addQty;
          await inv.save();

          product.location.push({ inventoryId: inv._id, stock: addQty });
          remain -= addQty;
        }
      }
    }

    // 如果还有剩余，尝试分配到空货架
    if (remain > 0) {
      for (let inv of inventories) {
        if (remain <= 0) break;

        // 只考虑还没有该产品的货架
        if (!inv.products.some((p) => p.productId.equals(productId))) {
          let available = inv.maxQuantitative - inv.currentQuantitative;
          let addQty = Math.min(remain, available);

          if (addQty > 0) {
            inv.products.push({ productId, quantity: addQty });
            inv.currentQuantitative += addQty;
            await inv.save();

            product.location.push({ inventoryId: inv._id, stock: addQty });
            remain -= addQty;
          }
        }
      }
    }

    await product.save();
  } else {
    // 如果没有指定productId，则不进行任何分配操作
    // 原有的自动分配所有产品的行为已经被移除
    console.log("未指定productId，不进行重新分配");
  }
}
// Thêm sản phẩm với số lượng và cân nặng vào kệ
exports.addProductWithQuantityToInventory = async (req, res) => {
  try {
    const { inventoryId, productId, quantity, weight } = req.body;
    if (
      !inventoryId ||
      !productId ||
      !quantity ||
      quantity <= 0 ||
      !weight ||
      weight <= 0
    ) {
      return res.status(400).json({
        message: "Thiếu thông tin hoặc số lượng/cân nặng không hợp lệ",
      });
    }

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({ message: "Không tìm thấy kệ" });
    }

    // Kiểm tra chỗ trống số lượng
    if (inventory.currentQuantitative + quantity > inventory.maxQuantitative) {
      return res
        .status(400)
        .json({ message: "Kệ không đủ chỗ trống về số lượng" });
    }

    // Kiểm tra chỗ trống cân nặng
    if (inventory.currentWeight + weight > inventory.maxWeight) {
      return res
        .status(400)
        .json({ message: "Kệ không đủ chỗ trống về cân nặng" });
    }

    // Thêm sản phẩm vào mảng products nếu chưa có
    if (!inventory.products.includes(productId)) {
      inventory.products.push(productId);
    }

    // Cập nhật số lượng và cân nặng hiện tại của kệ
    inventory.currentQuantitative += quantity;
    inventory.currentWeight += weight;
    await inventory.save();

    // Cập nhật tổng tồn kho sản phẩm
    await Product.findByIdAndUpdate(productId, {
      $inc: { totalStock: quantity },
    });

    res.json({ message: "Thêm sản phẩm vào kệ thành công", inventory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllInventories = async (req, res) => {
  try {
    // 获取所有货架，并填充categoryId字段
    const inventories = await Inventory.find()
      .populate("categoryId")
      .sort({ createdAt: 1 });

    // 查询所有产品（用于获取完整的产品信息）
    const allProducts = await Product.find();

    // 构建返回结果，保留货架的真实状态
    const result = inventories.map((inv) => {
      // 将货架上的每个产品ID转换为完整产品信息
      const productsOnShelf = inv.products
        .map((item) => {
          const product = allProducts.find(
            (p) => p._id.toString() === item.productId.toString()
          );
          if (!product) return null; // 如果找不到产品，返回null

          return {
            productId: item.productId,
            productName: product.productName,
            quantity: item.quantity,
            totalStock: product.totalStock,
            unit: product.unit,
            weight: product.weight || 0,
            quantitative: product.quantitative || 0,
            categoryId: product.categoryId,
          };
        })
        .filter((p) => p !== null); // 过滤掉空值

      // 返回货架信息，包括其上实际存放的产品
      return {
        _id: inv._id,
        name: inv.name,
        location: inv.location,
        category: inv.categoryId,
        maxQuantitative: inv.maxQuantitative,
        currentQuantitative: inv.currentQuantitative,
        maxWeight: inv.maxWeight,
        currentWeight: inv.currentWeight,
        status: inv.status,
        priority: inv.priority || 0,
        products: productsOnShelf,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Khi xóa kệ, cập nhật lại location trong Product
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Inventory.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy kệ để xóa" });
    }
    // Xóa location liên quan trong tất cả sản phẩm
    await Product.updateMany(
      { "location.inventoryId": id },
      { $pull: { location: { inventoryId: id } } }
    );
    res.json({ message: "Xóa kệ thành công", inventory: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm sản phẩm vào kệ (nhập hàng trực tiếp)
exports.addProductToShelf = async (req, res) => {
  try {
    const { inventoryId, productId, quantity, weight } = req.body;

    if (!inventoryId || !productId || !quantity) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({ message: "Không tìm thấy kệ hàng" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Kiểm tra trùng khớp danh mục
    if (!inventory.categoryId.equals(product.categoryId)) {
      return res.status(400).json({
        message: "Sản phẩm không thuộc danh mục của kệ này",
      });
    }

    // 计算能放入当前货架的数量
    const availableSpace =
      inventory.maxQuantitative - inventory.currentQuantitative;
    let addToCurrentShelf = Math.min(quantity, availableSpace);
    let remainingQuantity = quantity - addToCurrentShelf;

    // 处理当前货架
    if (addToCurrentShelf > 0) {
      // 找到产品在货架中的记录（如果存在）
      const existingProduct = inventory.products.find(
        (p) => p.productId.toString() === productId
      );

      if (existingProduct) {
        // 已有产品，增加数量
        existingProduct.quantity += addToCurrentShelf;
      } else {
        // 添加新产品到货架
        inventory.products.push({ productId, quantity: addToCurrentShelf });
      }

      // 更新货架总数量和重量
      inventory.currentQuantitative += addToCurrentShelf;
      inventory.currentWeight += ((weight || 0) * addToCurrentShelf) / quantity;

      await inventory.save();

      // 更新产品location
      const existingLocation = product.location.find(
        (loc) => loc.inventoryId.toString() === inventoryId
      );

      if (existingLocation) {
        existingLocation.stock += addToCurrentShelf;
      } else {
        product.location.push({
          inventoryId,
          stock: addToCurrentShelf,
        });
      }
    }

    // 处理剩余数量（自动分配到其他货架）
    let distributed = [
      {
        inventoryId: inventory._id,
        added: addToCurrentShelf,
      },
    ];

    if (remainingQuantity > 0) {
      // 获取同类别、除当前货架外的所有货架，按优先级排序
      const otherInventories = await Inventory.find({
        _id: { $ne: inventoryId },
        categoryId: product.categoryId,
        status: "active",
        $expr: { $lt: ["$currentQuantitative", "$maxQuantitative"] },
      }).sort({ priority: 1, createdAt: 1 });

      // 1. 先考虑已有该产品的货架
      for (const inv of otherInventories) {
        if (remainingQuantity <= 0) break;

        // 检查货架是否已有该产品
        const hasProduct = inv.products.some(
          (p) => p.productId.toString() === productId
        );
        if (!hasProduct) continue;

        const available = inv.maxQuantitative - inv.currentQuantitative;
        const addQty = Math.min(remainingQuantity, available);

        if (addQty > 0) {
          // 找到产品记录并更新
          const productInShelf = inv.products.find(
            (p) => p.productId.toString() === productId
          );
          productInShelf.quantity += addQty;

          inv.currentQuantitative += addQty;
          await inv.save();

          // 更新产品location
          const existingLoc = product.location.find(
            (loc) => loc.inventoryId.toString() === inv._id.toString()
          );

          if (existingLoc) {
            existingLoc.stock += addQty;
          } else {
            product.location.push({
              inventoryId: inv._id,
              stock: addQty,
            });
          }

          distributed.push({
            inventoryId: inv._id,
            added: addQty,
          });

          remainingQuantity -= addQty;
        }
      }

      // 2. 再考虑空货架
      if (remainingQuantity > 0) {
        for (const inv of otherInventories) {
          if (remainingQuantity <= 0) break;

          // 检查货架是否已有该产品
          const hasProduct = inv.products.some(
            (p) => p.productId.toString() === productId
          );
          if (hasProduct) continue;

          const available = inv.maxQuantitative - inv.currentQuantitative;
          const addQty = Math.min(remainingQuantity, available);

          if (addQty > 0) {
            // 添加新产品到货架
            inv.products.push({ productId, quantity: addQty });
            inv.currentQuantitative += addQty;
            await inv.save();

            // 添加新location到产品
            product.location.push({
              inventoryId: inv._id,
              stock: addQty,
            });

            distributed.push({
              inventoryId: inv._id,
              added: addQty,
            });

            remainingQuantity -= addQty;
          }
        }
      }
    }

    // 更新产品总库存
    product.totalStock += quantity - remainingQuantity;
    await product.save();

    if (remainingQuantity > 0) {
      return res.status(200).json({
        message: `Đã phân bổ một phần, còn dư ${remainingQuantity} sản phẩm chưa được phân bổ do kệ đã đầy.`,
        distributed,
      });
    }

    res.json({
      message: "Thêm sản phẩm vào kệ thành công",
      distributed,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeProductFromShelf = async (req, res) => {
  try {
    const { inventoryId, productId, quantity } = req.body;

    if (!inventoryId || !productId || !quantity) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({ message: "Không tìm thấy kệ hàng" });
    }

    // Tìm sản phẩm trong kệ
    const productIndex = inventory.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm trong kệ này",
      });
    }

    const currentQty = inventory.products[productIndex].quantity;

    // Kiểm tra số lượng xuất không vượt quá số lượng hiện có
    if (quantity > currentQty) {
      return res.status(400).json({
        message: `Số lượng xuất (${quantity}) vượt quá số lượng hiện có (${currentQty})`,
      });
    }

    // Cập nhật hoặc xóa sản phẩm khỏi kệ
    if (quantity === currentQty) {
      inventory.products.splice(productIndex, 1);
    } else {
      inventory.products[productIndex].quantity -= quantity;
    }

    // Cập nhật tổng số lượng của kệ
    inventory.currentQuantitative -= quantity;

    await inventory.save();

    // CẬP NHẬT LOCATION TRONG MODEL SẢN PHẨM
    const product = await Product.findById(productId);
    if (product) {
      const locationIndex = product.location.findIndex(
        (loc) => loc.inventoryId.toString() === inventoryId
      );

      if (locationIndex !== -1) {
        if (quantity === product.location[locationIndex].stock) {
          // Xóa vị trí nếu xuất hết sản phẩm
          product.location.splice(locationIndex, 1);
        } else {
          // Giảm số lượng
          product.location[locationIndex].stock -= quantity;
        }

        await product.save();
      }
    }

    res.json({ message: "Xuất sản phẩm từ kệ thành công", inventory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
