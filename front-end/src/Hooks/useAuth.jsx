import { useState } from 'react';
import authAPI from '../API/authAPI';

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.login(credentials);
      setUser(data.user || data);
      localStorage.setItem('authToken', data.token);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
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
      setError(err.response?.data?.message || err.message || 'Register failed');
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
      setError(err.response?.data?.message || err.message || 'Token refresh failed');
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
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Logout failed');
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
  };
};

export default useAuth;
