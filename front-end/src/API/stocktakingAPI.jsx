import axios from "axios";
import unauthorApi from "./baseAPI/unauthorAPI";
import authorApi from "./baseAPI/authorAPI";

const BASE_URL = "http://localhost:9999/stocktaking";
const INVENTORY_BASE_URL = "http://localhost:9999/inventory";

// Lấy danh sách kệ
export const getInventories = async () => {
  try {
    const response = await authorApi.get(INVENTORY_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách kệ:", error);
    throw error;
  }
};

// Lấy lịch sử kiểm kê
export const getStocktakingHistory = async () => {
  try {
    const response = await authorApi.get(`${BASE_URL}/history`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử kiểm kê:", error);
    throw error;
  }
};

// Lấy chi tiết phiếu kiểm kê
export const getStocktakingDetail = async (taskId) => {
  try {
    const response = await authorApi.get(`${BASE_URL}/detail/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết phiếu kiểm kê:", error);
    throw error;
  }
};

// Tạo phiếu kiểm kê chờ xử lý
export const createPendingStocktaking = async (data) => {
  try {
    const response = await authorApi.post(`${BASE_URL}/create-pending`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo phiếu kiểm kê chờ xử lý:", error);
    throw error;
  }
};

// Cập nhật phiếu kiểm kê
export const updateStocktaking = async (taskId, data) => {
  try {
    const response = await authorApi.put(`${BASE_URL}/update/${taskId}`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật phiếu kiểm kê:", error);
    throw error;
  }
};

// Tạo phiếu điều chỉnh
export const createAdjustment = async (data) => {
  try {
    const response = await authorApi.post(`${BASE_URL}/adjustment`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo phiếu điều chỉnh:", error);
    throw error;
  }
};

// Lấy lịch sử điều chỉnh
export const getAdjustmentHistory = async () => {
  try {
    const response = await authorApi.get(`${BASE_URL}/adjustment-history`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử điều chỉnh:", error);
    throw error;
  }
};

// Xóa phiếu kiểm kê
export const deleteStocktakingTask = async (taskId) => {
  try {
    const response = await authorApi.delete(`${BASE_URL}/delete/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa phiếu kiểm kê:", error);
    throw error;
  }
};
