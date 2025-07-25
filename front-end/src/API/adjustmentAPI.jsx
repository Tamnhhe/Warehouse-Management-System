import authorApi from "./baseAPI/authorAPI";

const API_URL = "/stocktaking";

const adjustmentAPI = {
  getAll: () => authorApi.get(`${API_URL}/adjustments`),
  getById: (id) => authorApi.get(`${API_URL}/adjustment/${id}`),
  create: (data) => authorApi.post(`${API_URL}/adjustment`, data),
  update: (id, data) => authorApi.put(`${API_URL}/adjustment/${id}`, data),
  delete: (id) => authorApi.delete(`${API_URL}/adjustment/${id}`),
  getByInventory: (inventoryId) => authorApi.get(`${API_URL}/adjustments/inventory/${inventoryId}`),
  getByDateRange: (startDate, endDate) => 
    authorApi.get(`${API_URL}/adjustments/date-range?start=${startDate}&end=${endDate}`),
};

export default adjustmentAPI;
