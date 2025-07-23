// Socket notification service
const notificationService = {
  // Gửi thông báo cho manager khi nhân viên tạo phiếu
  notifyManagerOnEmployeeAction: (io, notification) => {
    // Gửi cho tất cả managers
    io.to("role_manager").emit("newNotification", {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
      userId: notification.userId,
      data: notification.data,
    });
  },

  // Gửi thông báo cho nhân viên khi manager duyệt
  notifyEmployeeOnManagerApproval: (io, notification) => {
    // Gửi cho user cụ thể
    io.to(`user_${notification.userId}`).emit("newNotification", {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
      userId: notification.userId,
      data: notification.data,
    });
  },

  // Gửi thông báo cho cả branch
  notifyBranch: (io, branchId, notification) => {
    io.to(`branch_${branchId}`).emit("newNotification", {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
      userId: notification.userId,
      data: notification.data,
    });
  },
};

module.exports = notificationService;
