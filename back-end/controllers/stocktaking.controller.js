const db = require("../models/index");
const StocktakingTask = db.StocktakingTask;
const Adjustment = db.Adjustment;
const Inventory = db.Inventory;
const Product = db.Product;
const User = db.User;
const notificationController = require("./notification.controller");

// Tạo phiếu kiểm kê
exports.createStocktakingTask = async (req, res) => {
  try {
    const { inventoryId, products, auditor } = req.body;
    if (!inventoryId || !products || !auditor) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    // Lấy số lượng hệ thống cho từng sản phẩm trong kệ đang kiểm kê
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory)
      return res.status(404).json({ message: "Không tìm thấy kệ" });

    const taskProducts = products.map((p) => {
      const invProd = inventory.products.find(
        (ip) => ip.productId.toString() === p.productId
      );
      // Chỉ kiểm kê số lượng trong kệ này, không phải tổng số sản phẩm
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

    // Gửi thông báo Socket.IO cho manager khi tạo phiếu kiểm kê
    try {
      const io = req.app.get("io");
      const employee = await User.findById(auditor);
      const timestamp = new Date().toLocaleString("vi-VN");

      if (employee && io) {
        await notificationController.notifyManagerOnEmployeeAction(
          io,
          employee.fullName || employee.username,
          "kiểm kê",
          timestamp,
          employee.branchId
        );
      }
    } catch (notificationError) {
      console.error(
        "Error sending stocktaking notification:",
        notificationError
      );
    }

    res.status(201).json({ message: "Tạo phiếu kiểm kê thành công", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo phiếu kiểm kê trạng thái pending (chỉ chọn kệ và sản phẩm muốn kiểm)
exports.createPendingStocktakingTask = async (req, res) => {
  try {
    const {
      inventoryId,
      productIds,
      auditor,
      isWarehouseStocktaking,
      warehouseInventories,
    } = req.body;
    if (!inventoryId || !productIds || !auditor) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    let taskProducts = [];
    let relatedInventories = [];

    if (isWarehouseStocktaking && warehouseInventories) {
      // Xử lý cho phiếu kiểm kê toàn bộ kho
      for (const warehouseInv of warehouseInventories) {
        const inventory = await Inventory.findById(warehouseInv.inventoryId);
        if (inventory) {
          // Thêm thông tin kệ vào danh sách liên quan
          relatedInventories.push({
            inventoryId: inventory._id,
            inventoryName: inventory.name,
          });

          // Thêm sản phẩm từ kệ này với thông tin kệ
          warehouseInv.products.forEach((prodInfo) => {
            const invProd = inventory.products.find(
              (ip) => ip.productId.toString() === prodInfo.productId
            );

            if (invProd) {
              taskProducts.push({
                productId: prodInfo.productId,
                systemQuantity: invProd.quantity,
                actualQuantity: null,
                difference: null,
                inventoryName: inventory.name,
                originalInventoryId: inventory._id,
              });
            }
          });
        }
      }
    } else {
      // Xử lý cho phiếu kiểm kê từng kệ (logic cũ)
      const inventory = await Inventory.findById(inventoryId);
      if (!inventory)
        return res.status(404).json({ message: "Không tìm thấy kệ" });

      // Chỉ lấy các sản phẩm có trong kệ này
      for (const pid of productIds) {
        const invProd = inventory.products.find(
          (ip) => ip.productId.toString() === pid
        );

        if (invProd) {
          taskProducts.push({
            productId: pid,
            systemQuantity: invProd.quantity,
            actualQuantity: null,
            difference: null,
          });
        }
      }
    }

    const task = new StocktakingTask({
      inventoryId,
      products: taskProducts,
      auditor,
      status: "pending",
      isWarehouseStocktaking: isWarehouseStocktaking || false,
      relatedInventories: relatedInventories,
    });
    await task.save();

    // Gửi thông báo Socket.IO cho manager khi tạo phiếu kiểm kê pending
    try {
      const io = req.app.get("io");
      const employee = await User.findById(auditor);
      const timestamp = new Date().toLocaleString("vi-VN");

      if (employee && io) {
        await notificationController.notifyManagerOnEmployeeAction(
          io,
          employee.fullName || employee.username,
          "kiểm kê",
          timestamp,
          employee.branchId
        );
      }
    } catch (notificationError) {
      console.error(
        "Error sending pending stocktaking notification:",
        notificationError
      );
    }

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

    // Kiểm tra người dùng tồn tại
    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra quyền của người dùng
    if (user.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Chỉ quản lý mới có quyền tạo phiếu điều chỉnh" });
    }

    const task = await StocktakingTask.findById(stocktakingTaskId).populate(
      "auditor"
    );
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
      inventoryName: p.inventoryName, // Thêm thông tin kệ
      originalInventoryId: p.originalInventoryId, // Thêm ID kệ gốc
    }));

    const adjustment = new Adjustment({
      stocktakingTaskId,
      inventoryId: task.inventoryId,
      products: adjustmentProducts,
      createdBy,
    });
    await adjustment.save();

    // Chuẩn bị cập nhật totalStock của sản phẩm
    const productUpdates = {};

    if (task.isWarehouseStocktaking) {
      // Xử lý cho phiếu kiểm kê toàn bộ kho - cập nhật nhiều kệ
      console.log("Đang xử lý phiếu điều chỉnh toàn bộ kho...");

      // Nhóm sản phẩm theo kệ gốc của chúng
      const productsByInventory = {};

      for (const adj of adjustmentProducts) {
        const inventoryId = adj.originalInventoryId || task.inventoryId;
        if (!productsByInventory[inventoryId]) {
          productsByInventory[inventoryId] = [];
        }
        productsByInventory[inventoryId].push(adj);
      }

      // Cập nhật từng kệ
      for (const [inventoryId, products] of Object.entries(
        productsByInventory
      )) {
        const inventory = await Inventory.findById(inventoryId);
        if (!inventory) {
          console.warn(`Không tìm thấy kệ với ID: ${inventoryId}`);
          continue;
        }

        console.log(
          `Đang cập nhật kệ: ${inventory.name} với ${products.length} sản phẩm`
        );

        for (const adj of products) {
          const prod = inventory.products.find(
            (p) => p.productId.toString() === adj.productId.toString()
          );

          if (prod) {
            // Tính toán sự chênh lệch giữa số lượng mới và cũ
            const quantityDifference = adj.newQuantity - prod.quantity;

            console.log(
              `Sản phẩm ${adj.productId}: từ ${prod.quantity} -> ${adj.newQuantity} (chênh lệch: ${quantityDifference})`
            );

            // Cập nhật số lượng trong kệ hiện tại
            prod.quantity = adj.newQuantity; // Điều này sẽ cập nhật về 0 nếu newQuantity = 0

            // Log đặc biệt cho trường hợp sản phẩm về 0
            if (adj.newQuantity === 0) {
              console.log(
                `⚠️ Sản phẩm ${adj.productId} đã được điều chỉnh về 0 trong kệ ${inventory.name}`
              );
            }

            // Lưu lại chênh lệch để cập nhật totalStock
            if (!productUpdates[adj.productId]) {
              productUpdates[adj.productId] = quantityDifference;
            } else {
              productUpdates[adj.productId] += quantityDifference;
            }
          }
        }

        // Lưu thay đổi cho inventory này
        await inventory.save();
        console.log(`Đã lưu cập nhật cho kệ: ${inventory.name}`);
      }
    } else {
      // Xử lý cho phiếu kiểm kê từng kệ (logic cũ)
      const inventory = await Inventory.findById(task.inventoryId);

      for (const adj of adjustmentProducts) {
        const prod = inventory.products.find(
          (p) => p.productId.toString() === adj.productId.toString()
        );
        if (prod) {
          // Tính toán sự chênh lệch giữa số lượng mới và cũ
          const quantityDifference = adj.newQuantity - prod.quantity;

          // Cập nhật số lượng trong kệ hiện tại
          prod.quantity = adj.newQuantity; // Điều này sẽ cập nhật về 0 nếu newQuantity = 0

          // Log đặc biệt cho trường hợp sản phẩm về 0
          if (adj.newQuantity === 0) {
            console.log(
              `⚠️ Sản phẩm ${adj.productId} đã được điều chỉnh về 0 trong kệ ${inventory.name}`
            );
          }

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
    }

    // Cập nhật totalStock cho từng sản phẩm
    console.log("Đang cập nhật totalStock cho các sản phẩm...");
    for (const productId in productUpdates) {
      const difference = productUpdates[productId];

      // Tìm và cập nhật sản phẩm
      const product = await Product.findById(productId);
      if (product) {
        console.log(
          `Cập nhật totalStock cho sản phẩm ${productId}: ${
            product.totalStock
          } + ${difference} = ${product.totalStock + difference}`
        );

        product.totalStock += difference;

        // Cập nhật location stock cho tất cả các kệ chứa sản phẩm này
        if (task.isWarehouseStocktaking) {
          // Với phiếu kiểm kê toàn bộ kho, cập nhật location dựa trên originalInventoryId
          const productInTask = task.products.find(
            (p) => p.productId.toString() === productId
          );
          if (productInTask && productInTask.originalInventoryId) {
            product.location = product.location.map((loc) => {
              if (
                loc.inventoryId.toString() ===
                productInTask.originalInventoryId.toString()
              ) {
                const locationDifference =
                  productInTask.actualQuantity - productInTask.systemQuantity;
                loc.stock += locationDifference;
                console.log(
                  `Cập nhật location stock cho kệ ${productInTask.originalInventoryId}: ${loc.stock}`
                );
              }
              return loc;
            });
          }
        } else {
          // Với phiếu kiểm kê từng kệ (logic cũ)
          product.location = product.location.map((loc) => {
            if (loc.inventoryId.toString() === task.inventoryId.toString()) {
              loc.stock += difference;
            }
            return loc;
          });
        }

        await product.save();
      }
    }

    // Gắn adjustmentId vào task
    task.adjustmentId = adjustment._id;
    task.status = "adjusted"; // ✅ QUAN TRỌNG: Cập nhật trạng thái thành "adjusted" sau khi điều chỉnh
    await task.save();

    // Gửi thông báo Socket.IO cho nhân viên khi manager tạo phiếu điều chỉnh
    try {
      const io = req.app.get("io");
      const manager = user; // user đã được lấy ở trên
      const timestamp = new Date().toLocaleString("vi-VN");

      if (manager && task.auditor && io) {
        await notificationController.notifyEmployeeOnManagerApproval(
          io,
          task.auditor._id,
          manager.fullName || manager.username,
          "điều chỉnh sản phẩm trong phiếu kiểm kê",
          timestamp
        );
      }
    } catch (notificationError) {
      console.error(
        "Error sending adjustment notification:",
        notificationError
      );
    }

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

// Xóa phiếu kiểm kê (chỉ cho phép xóa phiếu pending và completed)
exports.deleteStocktakingTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm và kiểm tra phiếu kiểm kê
    const task = await StocktakingTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy phiếu kiểm kê" });
    }

    // Cho phép xóa phiếu có trạng thái pending và completed
    if (task.status !== "pending" && task.status !== "completed") {
      return res.status(400).json({
        message:
          "Chỉ có thể xóa phiếu kiểm kê đang chờ xử lý hoặc chờ điều chỉnh",
      });
    }

    // Xóa phiếu kiểm kê
    await StocktakingTask.findByIdAndDelete(id);

    res.json({
      message: "Xóa phiếu kiểm kê thành công",
      deletedTask: task,
    });
  } catch (err) {
    console.error("Lỗi khi xóa phiếu kiểm kê:", err);
    res.status(500).json({ message: err.message });
  }
};
