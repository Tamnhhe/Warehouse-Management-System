import { useState, useEffect, useCallback } from "react";
import authAPI from "../API/authAPI";

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Thêm function để lấy thông tin user từ token, sử dụng useCallback để tránh tạo lại hàm mỗi khi component render
  const getCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return null;

      setLoading(true);
      const data = await authAPI.getCurrentUser();
      setUser(data.user || data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Lỗi khi lấy thông tin người dùng:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to get user info"
      );
      setLoading(false);
      return null;
    }
  }, []);

  // Tự động kiểm tra user khi hook được gọi
  useEffect(() => {
    if (!user && localStorage.getItem("authToken")) {
      getCurrentUser();
    }
  }, [getCurrentUser]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.login(credentials);
      setUser(data.user || data);
      localStorage.setItem("authToken", data.token);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
      setLoading(false);
      return null;
    }
  };

  const register = async (form) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.register(form);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Register failed");
      setLoading(false);
      return null;
    }
  };

  const refreshToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.refreshToken();
      setLoading(false);
      return data;
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Token refresh failed"
      );
      setLoading(false);
      return null;
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.logout();
      setUser(null);
      localStorage.removeItem("authToken");
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Logout failed");
      setLoading(false);
      return null;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    refreshToken,
    logout,
    getCurrentUser,
  };
};

export default useAuth;
