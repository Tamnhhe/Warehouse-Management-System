const db = require("../models");
const notificationService = require("../utils/NotificationService");

const notificationController = {
  // Tạo thông báo mới và gửi qua Socket.IO
  createNotification: async (req, res) => {
    try {
      const { title, message, type, userId, data } = req.body;

      const notification = new db.Notification({
        title,
        message,
        type,
        userId,
        data: JSON.stringify(data || {}),
        isRead: false,
      });

      await notification.save();

      const io = req.app.get("io");

      // Gửi thông báo qua Socket.IO dựa trên type
      if (type === "employee_action") {
        notificationService.notifyManagerOnEmployeeAction(io, notification);
      } else if (type === "manager_approval") {
        notificationService.notifyEmployeeOnManagerApproval(io, notification);
      }

      res.status(201).json({
        success: true,
        message: "Thông báo đã được tạo thành công",
        data: notification,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tạo thông báo",
        error: error.message,
      });
    }
  },

  // Lấy danh sách thông báo của user
  getUserNotifications: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const notifications = await db.Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      const totalCount = await db.Notification.countDocuments({ userId });

      res.status(200).json({
        success: true,
        data: {
          notifications: notifications,
          totalCount: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: parseInt(page),
        },
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách thông báo",
        error: error.message,
      });
    }
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;

      await db.Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Đã đánh dấu thông báo là đã đọc",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi đánh dấu thông báo đã đọc",
        error: error.message,
      });
    }
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: async (req, res) => {
    try {
      const { userId } = req.params;

      await db.Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      res.status(200).json({
        success: true,
        message: "Đã đánh dấu tất cả thông báo là đã đọc",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi đánh dấu tất cả thông báo đã đọc",
        error: error.message,
      });
    }
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async (req, res) => {
    try {
      const { userId } = req.params;

      const unreadCount = await db.Notification.countDocuments({
        userId,
        isRead: false,
      });

      res.status(200).json({
        success: true,
        data: { unreadCount },
      });
    } catch (error) {
      console.error("Error getting unread count:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy số lượng thông báo chưa đọc",
        error: error.message,
      });
    }
  },

  // Helper function để tạo thông báo cho manager khi nhân viên tạo phiếu
  notifyManagerOnEmployeeAction: async (
    io,
    employeeName,
    actionType,
    timestamp,
    branchId
  ) => {
    try {
      // Lấy danh sách managers trong branch
      const managers = await db.User.find({
        role: "manager",
        branchId: branchId,
      });

      for (const manager of managers) {
        let title, message;

        // Tùy chỉnh thông báo theo loại hành động
        switch (actionType) {
          case "nhập kho":
            title = "Đơn nhập hàng mới";
            message = `${employeeName} đã tạo đơn nhập hàng vào ${timestamp}`;
            break;
          case "xuất kho":
            title = "Đơn xuất hàng mới";
            message = `${employeeName} đã tạo đơn xuất hàng vào ${timestamp}`;
            break;
          case "kiểm kê":
            title = "Đơn kiểm kê mới";
            message = `${employeeName} đã tạo đơn kiểm kê vào ${timestamp}`;
            break;
          default:
            title = `Phiếu ${actionType} mới`;
            message = `${employeeName} đã tạo phiếu ${actionType} vào ${timestamp}`;
        }

        const notification = new db.Notification({
          title,
          message,
          type: "employee_action",
          userId: manager._id,
          data: JSON.stringify({
            employeeName,
            actionType,
            timestamp,
            branchId,
          }),
          isRead: false,
        });

        await notification.save();
        notificationService.notifyManagerOnEmployeeAction(io, notification);
      }
    } catch (error) {
      console.error("Error notifying manager:", error);
    }
  },

  // Helper function để tạo thông báo cho nhân viên khi manager duyệt
  notifyEmployeeOnManagerApproval: async (
    io,
    employeeId,
    managerName,
    actionType,
    timestamp
  ) => {
    try {
      let title, message;

      // Tùy chỉnh thông báo theo loại hành động
      switch (actionType) {
        case "duyệt đơn nhập kho":
          title = "Đơn nhập kho đã được duyệt";
          message = `Manager ${managerName} đã duyệt đơn nhập kho của bạn vào ${timestamp}`;
          break;
        case "duyệt đơn xuất kho":
          title = "Đơn xuất kho đã được duyệt";
          message = `Manager ${managerName} đã duyệt đơn xuất kho của bạn vào ${timestamp}`;
          break;
        case "duyệt đơn kiểm kê":
          title = "Đơn kiểm kê đã được duyệt";
          message = `Manager ${managerName} đã duyệt đơn kiểm kê của bạn vào ${timestamp}`;
          break;
        case "điều chỉnh sản phẩm trong phiếu kiểm kê":
          title = "Phiếu điều chỉnh đã được tạo";
          message = `Manager ${managerName} đã tạo phiếu điều chỉnh cho đơn kiểm kê của bạn vào ${timestamp}`;
          break;
        default:
          title = `Phiếu ${actionType} đã được duyệt`;
          message = `Manager ${managerName} đã duyệt phiếu ${actionType} của bạn vào ${timestamp}`;
      }

      const notification = new db.Notification({
        title,
        message,
        type: "manager_approval",
        userId: employeeId,
        data: JSON.stringify({
          managerName,
          actionType,
          timestamp,
        }),
        isRead: false,
      });

      await notification.save();
      notificationService.notifyEmployeeOnManagerApproval(io, notification);
    } catch (error) {
      console.error("Error notifying employee:", error);
    }
  },
};

module.exports = notificationController;
