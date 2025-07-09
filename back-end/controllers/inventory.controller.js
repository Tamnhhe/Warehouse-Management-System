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
      const productDoc = await Product.findOne({ productName: item.productName });
      if (productDoc) {
        item.productId = productDoc._id;
      } else {
        return res.status(400).json({ message: `Không tìm thấy sản phẩm: ${item.productName}` });
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
    let productId = item.productId || item.supplierProductId?.product || item.product;
    let quantity = item.achievedProduct || item.requestQuantity || item.quantity;

    let productDoc = await Product.findById(productId);
    let categoryId = item.categoryId || productDoc?.categoryId;

    if (!productId || !categoryId || !quantity) continue;

    let inventories = await Inventory.find({
      categoryId,
      status: "active",
      $expr: { $lt: ["$currentQuantitative", "$maxQuantitative"] }
    }).sort({ createdAt: 1 });

    let remain = quantity;
    for (let inv of inventories) {
      let available = inv.maxQuantitative - inv.currentQuantitative;
      let addQty = Math.min(remain, available);

      if (addQty > 0) {
        // Tìm sản phẩm trong kệ
        let prodObj = inv.products.find(p => p.productId.equals(productId));
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
      console.log(`Còn dư ${remain} sản phẩm ${productId} chưa phân bổ được vào kệ nào!`);
    }
  }
};

async function autoDeductProductsFromInventories(products) {
  for (const p of products) {
    let quantityToDeduct = p.requestQuantity;
    // Tìm tất cả inventory có chứa sản phẩm này, ưu tiên kệ có nhiều hàng trước
    const inventories = await Inventory.find({ "products.productId": p.productId }).sort({ "products.quantity": -1 });
    for (const inv of inventories) {
      if (quantityToDeduct <= 0) break;
      // Tìm đúng object sản phẩm trong kệ
      let prodObj = inv.products.find(obj => obj.productId.equals(p.productId));
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
    await Product.findByIdAndUpdate(
      p.productId,
      { $inc: { totalStock: -p.requestQuantity } }
    );
  }
}
exports.autoDeductProductsFromInventories = autoDeductProductsFromInventories;
// Nhập hàng tự động phân bổ vào nhiều kệ đúng loại sản phẩm
exports.importProductAutoDistribute = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Thiếu thông tin hoặc số lượng không hợp lệ" });
    }

    // Lấy sản phẩm để biết categoryId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    const categoryId = product.categoryId;

    let remain = quantity;
    let distributed = [];

    // Lấy danh sách các kệ cùng categoryId (ưu tiên kệ đã có sản phẩm, sau đó kệ còn trống)
    let inventories = await Inventory.find({ categoryId }).sort({ _id: 1 });

    for (let inventory of inventories) {
      if (inventory.currentQuantitative >= inventory.maxQuantitative) continue;

      let available = inventory.maxQuantitative - inventory.currentQuantitative;
      let addQty = Math.min(remain, available);

      if (addQty > 0) {
        if (!inventory.products.includes(productId)) {
          inventory.products.push(productId);
        }
        inventory.currentQuantitative += addQty;
        await inventory.save();

        distributed.push({ inventoryId: inventory._id, added: addQty });
        remain -= addQty;
      }

      if (remain <= 0) break;
    }

    // Cập nhật tổng tồn kho sản phẩm
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { totalStock: quantity - remain } }
    );

    if (remain > 0) {
      return res.status(200).json({
        message: `Đã phân bổ hết chỗ, còn dư ${remain} sản phẩm chưa được nhập.`,
        distributed
      });
    }

    res.json({ message: "Nhập hàng và phân bổ thành công!", distributed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Thêm kệ mới
exports.createInventory = async (req, res) => {
  try {
    // ĐÃ BỎ creator khỏi destructuring
    const { name, categoryId, maxQuantitative, maxWeight, status } = req.body;

    if (
      !name ||
      !categoryId ||
      !maxQuantitative ||
      !maxWeight
    ) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Kiểm tra nếu đã có kệ cùng tên
    const existingInventory = await Inventory.findOne({ name });
    if (existingInventory) {
      return res.status(400).json({ message: "Tên kệ đã tồn tại, vui lòng chọn tên khác!" });
    }

    // Tạo kệ mới với số lượng hiện tại = 0, KHÔNG có trường creator
    const newInventory = new Inventory({
      name,
      categoryId,
      maxQuantitative,
      maxWeight,
      currentQuantitative: 0,
      currentWeight: 0,
      status: status || "active",
      products: []
    });

    await newInventory.save();

    // Sau khi tạo kệ mới, phân bổ lại tồn kho cho toàn bộ kệ cùng category
    await redistributeStockForCategory(categoryId);

    res.status(201).json({ message: "Tạo kệ mới thành công và đã phân bổ lại tồn kho!", inventory: newInventory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Hàm phân bổ lại tồn kho cho tất cả kệ cùng category
async function redistributeStockForCategory(categoryId) {
  // Lấy tổng tồn kho của tất cả sản phẩm thuộc category này
  const products = await Product.find({ categoryId });
  const totalStock = products.reduce((sum, p) => sum + (p.totalStock || 0), 0);

  // Lấy tất cả kệ cùng category, sắp xếp theo ngày tạo
  const inventories = await Inventory.find({ categoryId }).sort({ createdAt: 1 });

  let remain = totalStock;

  // Reset lại số lượng từng kệ
  for (let inv of inventories) {
    inv.currentQuantitative = 0;
    inv.products = [];
    await inv.save();
  }

  // Phân bổ lại tồn kho vào các kệ
  for (let inv of inventories) {
    let available = inv.maxQuantitative;
    let addQty = Math.min(remain, available);

    if (addQty > 0) {
      inv.currentQuantitative = addQty;
      // Nếu chỉ muốn lưu tổng số lượng, không cần products chi tiết
      // Nếu muốn lưu chi tiết từng sản phẩm, cần duyệt từng product
      inv.products = []; // hoặc có thể push từng sản phẩm nếu muốn
      await inv.save();
      remain -= addQty;
    }
    if (remain <= 0) break;
  }
}
// Thêm sản phẩm với số lượng và cân nặng vào kệ
exports.addProductWithQuantityToInventory = async (req, res) => {
  try {
    const { inventoryId, productId, quantity, weight } = req.body;
    if (!inventoryId || !productId || !quantity || quantity <= 0 || !weight || weight <= 0) {
      return res.status(400).json({ message: "Thiếu thông tin hoặc số lượng/cân nặng không hợp lệ" });
    }

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({ message: "Không tìm thấy kệ" });
    }

    // Kiểm tra chỗ trống số lượng
    if (inventory.currentQuantitative + quantity > inventory.maxQuantitative) {
      return res.status(400).json({ message: "Kệ không đủ chỗ trống về số lượng" });
    }

    // Kiểm tra chỗ trống cân nặng
    if (inventory.currentWeight + weight > inventory.maxWeight) {
      return res.status(400).json({ message: "Kệ không đủ chỗ trống về cân nặng" });
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
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { totalStock: quantity } }
    );

    res.json({ message: "Thêm sản phẩm vào kệ thành công", inventory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllInventories = async (req, res) => {
  try {
    // Lấy tất cả kệ và sản phẩm
    const inventories = await Inventory.find().populate("categoryId").sort({ createdAt: 1 });
    const allProducts = await Product.find();

    // Gom kệ theo categoryId
    const categoryMap = {};
    inventories.forEach(inv => {
      const catId = inv.categoryId._id.toString();
      if (!categoryMap[catId]) categoryMap[catId] = [];
      categoryMap[catId].push(inv);
    });

    // Kết quả trả về
    let result = [];

    // Duyệt từng category
    for (const catId in categoryMap) {
      // Lấy tất cả sản phẩm thuộc category này
      const productsInCategory = allProducts.filter(p => p.categoryId.toString() === catId);

      // Tạo bản sao số lượng tồn kho từng sản phẩm
      let productRemain = {};
      productsInCategory.forEach(p => {
        productRemain[p._id.toString()] = p.totalStock;
      });

      // Duyệt từng kệ trong category này
      const invs = categoryMap[catId];
      for (let inv of invs) {
        let invProducts = [];
        let invCurrent = 0;

        // Duyệt từng sản phẩm, phân bổ vào kệ này
        for (let p of productsInCategory) {
          if (invCurrent >= inv.maxQuantitative) break;
          let remain = productRemain[p._id.toString()];
          if (!remain || remain <= 0) continue;

          // Số lượng có thể thêm vào kệ này
          let canAdd = Math.min(remain, inv.maxQuantitative - invCurrent);
          if (canAdd > 0) {
            invProducts.push({
              productId: p._id,
              productName: p.productName,
              quantity: canAdd,
              totalStock: p.totalStock,
              unit: p.unit
            });
            invCurrent += canAdd;
            productRemain[p._id.toString()] -= canAdd;
          }
        }

        result.push({
          _id: inv._id,
          name: inv.name,
          category: inv.categoryId,
          maxQuantitative: inv.maxQuantitative,
          currentQuantitative: invCurrent,
          maxWeight: inv.maxWeight,
          currentWeight: inv.currentWeight,
          status: inv.status,
          products: invProducts
        });
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Inventory.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy kệ để xóa" });
    }
    res.json({ message: "Xóa kệ thành công", inventory: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
