import authorApi from "./baseAPI/authorAPI";

const API_URL = "/notifications";

const notificationAPI = {
  getAll: () => authorApi.get(`${API_URL}/getAllNotifications`),
  getById: (id) => authorApi.get(`${API_URL}/getNotificationById/${id}`),
  getUserNotifications: (userId) => authorApi.get(`${API_URL}/getUserNotifications/${userId}`),
  create: (data) => authorApi.post(`${API_URL}/createNotification`, data),
  update: (id, data) => authorApi.put(`${API_URL}/updateNotification/${id}`, data),
  delete: (id) => authorApi.delete(`${API_URL}/deleteNotification/${id}`),
  markAsRead: (id) => authorApi.put(`${API_URL}/markAsRead/${id}`),
  markAllAsRead: (userId) => authorApi.put(`${API_URL}/markAllAsRead/${userId}`),
};

export default notificationAPI;
