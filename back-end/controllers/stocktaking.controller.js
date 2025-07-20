const db = require("../models/index");
const StocktakingTask = db.StocktakingTask;
const Adjustment = db.Adjustment;
const Inventory = db.Inventory;
const Product = db.Product;
const User = db.User;

// Tạo phiếu kiểm kê
exports.createStocktakingTask = async (req, res) => {
  try {
    const { inventoryId, products, auditor } = req.body;
    if (!inventoryId || !products || !auditor) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    // Lấy số lượng hệ thống cho từng sản phẩm
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory)
      return res.status(404).json({ message: "Không tìm thấy kệ" });
    const taskProducts = products.map((p) => {
      const invProd = inventory.products.find(
        (ip) => ip.productId.toString() === p.productId
      );
      return {
        productId: p.productId,
        systemQuantity: invProd ? invProd.quantity : 0,
        actualQuantity: p.actualQuantity,
        difference: p.actualQuantity - (invProd ? invProd.quantity : 0),
      };
    });
    const task = new StocktakingTask({
      inventoryId,
      products: taskProducts,
      auditor,
      status: "completed",
      checkedAt: new Date(),
    });
    await task.save();
    res.status(201).json({ message: "Tạo phiếu kiểm kê thành công", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo phiếu kiểm kê trạng thái pending (chỉ chọn kệ và sản phẩm muốn kiểm)
exports.createPendingStocktakingTask = async (req, res) => {
  try {
    const { inventoryId, productIds, auditor } = req.body;
    if (!inventoryId || !productIds || !auditor) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    // Lấy số lượng hệ thống cho từng sản phẩm
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory)
      return res.status(404).json({ message: "Không tìm thấy kệ" });
    const taskProducts = productIds.map((pid) => {
      const invProd = inventory.products.find(
        (ip) => ip.productId.toString() === pid
      );
      return {
        productId: pid,
        systemQuantity: invProd ? invProd.quantity : 0,
        actualQuantity: null,
        difference: null,
      };
    });
    const task = new StocktakingTask({
      inventoryId,
      products: taskProducts,
      auditor,
      status: "pending",
    });
    await task.save();
    res
      .status(201)
      .json({ message: "Tạo phiếu kiểm kê (pending) thành công", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật phiếu kiểm kê: nhập số lượng thực tế, xác nhận
exports.updateStocktakingTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { products } = req.body; // [{productId, actualQuantity, note}]
    const task = await StocktakingTask.findById(id);
    if (!task)
      return res.status(404).json({ message: "Không tìm thấy phiếu kiểm kê" });
    if (task.status !== "pending")
      return res.status(400).json({ message: "Phiếu kiểm kê đã hoàn thành" });
    // Cập nhật actualQuantity và difference
    task.products = task.products.map((tp) => {
      const found = products.find(
        (p) => p.productId === tp.productId.toString()
      );
      if (found) {
        return {
          ...tp.toObject(),
          actualQuantity: found.actualQuantity,
          difference: found.actualQuantity - tp.systemQuantity,
          note: found.note || "",
        };
      }
      return tp;
    });
    task.status = "completed";
    task.checkedAt = new Date();
    await task.save();
    res.json({ message: "Cập nhật phiếu kiểm kê thành công", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// So sánh và tạo phiếu điều chỉnh nếu lệch
exports.createAdjustment = async (req, res) => {
  try {
    const { stocktakingTaskId, createdBy } = req.body;

    // 验证是否为manager角色
    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // 检查用户角色是否为manager
    if (user.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Chỉ quản lý mới có quyền tạo phiếu điều chỉnh" });
    }

    const task = await StocktakingTask.findById(stocktakingTaskId);
    if (!task)
      return res.status(404).json({ message: "Không tìm thấy phiếu kiểm kê" });
    if (task.status !== "completed")
      return res.status(400).json({ message: "Phiếu kiểm kê chưa hoàn thành" });
    // Kiểm tra có lệch không
    const diffProducts = task.products.filter((p) => p.difference !== 0);
    if (diffProducts.length === 0) {
      return res
        .status(200)
        .json({ message: "Không có lệch kho, không cần điều chỉnh" });
    }
    // Tạo phiếu điều chỉnh
    const adjustmentProducts = diffProducts.map((p) => ({
      productId: p.productId,
      oldQuantity: p.systemQuantity,
      newQuantity: p.actualQuantity,
      difference: p.difference,
    }));
    const adjustment = new Adjustment({
      stocktakingTaskId,
      inventoryId: task.inventoryId,
      products: adjustmentProducts,
      createdBy,
    });
    await adjustment.save();

    // Cập nhật lại số lượng sản phẩm trong kệ
    const inventory = await Inventory.findById(task.inventoryId);

    // Chuẩn bị cập nhật totalStock của sản phẩm
    const productUpdates = {};

    for (const adj of adjustmentProducts) {
      const prod = inventory.products.find(
        (p) => p.productId.toString() === adj.productId.toString()
      );
      if (prod) {
        // Tính toán sự chênh lệch giữa số lượng mới và cũ
        const quantityDifference = adj.newQuantity - prod.quantity;

        // Cập nhật số lượng trong kệ
        prod.quantity = adj.newQuantity;

        // Lưu lại chênh lệch để cập nhật totalStock
        if (!productUpdates[adj.productId]) {
          productUpdates[adj.productId] = quantityDifference;
        } else {
          productUpdates[adj.productId] += quantityDifference;
        }
      }
    }

    // Lưu thay đổi cho inventory
    await inventory.save();

    // Cập nhật totalStock cho từng sản phẩm
    for (const productId in productUpdates) {
      const difference = productUpdates[productId];

      // Tìm và cập nhật sản phẩm
      const product = await Product.findById(productId);
      if (product) {
        product.totalStock += difference;
        await product.save();
        console.log(
          `Đã cập nhật totalStock của sản phẩm ${productId}: ${product.totalStock}`
        );
      }
    }

    // Gắn adjustmentId vào task
    task.adjustmentId = adjustment._id;
    await task.save();

    res
      .status(201)
      .json({ message: "Tạo phiếu điều chỉnh thành công", adjustment });
  } catch (err) {
    console.error("Lỗi khi tạo phiếu điều chỉnh:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy lịch sử kiểm kê
exports.getStocktakingHistory = async (req, res) => {
  try {
    const tasks = await StocktakingTask.find()
      .populate("inventoryId auditor adjustmentId")
      .sort({ checkedAt: -1 })
      .lean();
    // Populate product info for each task
    for (const task of tasks) {
      for (const prod of task.products) {
        const product = await Product.findById(prod.productId).lean();
        prod.productName = product?.productName || prod.productId;
        prod.unit = product?.unit || "";
      }
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy lịch sử điều chỉnh
exports.getAdjustmentHistory = async (req, res) => {
  try {
    const adjustments = await Adjustment.find()
      .populate("stocktakingTaskId inventoryId createdBy")
      .sort({ createdAt: -1 });
    res.json(adjustments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết phiếu kiểm kê
exports.getStocktakingTaskDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await StocktakingTask.findById(id)
      .populate("inventoryId auditor adjustmentId")
      .lean();
    if (!task)
      return res.status(404).json({ message: "Không tìm thấy phiếu kiểm kê" });
    // Populate product info
    for (const prod of task.products) {
      const product = await Product.findById(prod.productId).lean();
      prod.productName = product?.productName || prod.productId;
      prod.unit = product?.unit || "";
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
