import axios from "axios";

const API_BASE_URL = "http://localhost:9999";

class NotificationService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Lấy danh sách thông báo của user
  async getUserNotifications(userId, page = 1, limit = 10) {
    try {
      const response = await this.api.get(`/notifications/user/${userId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount(userId) {
    try {
      const response = await this.api.get(
        `/notifications/user/${userId}/unread-count`
      );
      return response.data.data.unreadCount;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId) {
    try {
      const response = await this.api.put(
        `/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(userId) {
    try {
      const response = await this.api.put(
        `/notifications/user/${userId}/read-all`
      );
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Tạo thông báo mới
  async createNotification(notificationData) {
    try {
      const response = await this.api.post("/notifications", notificationData);
      return response.data;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }
}

export default new NotificationService();
