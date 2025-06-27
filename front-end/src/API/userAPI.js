import axios from "axios";
const API_URL = "http://localhost:9999/users";

const userAPI = {
    getProfile: (token) => axios.get(`${API_URL}/view-profile`, { headers: { Authorization: token } }),
    editProfile: (formData, token) => axios.put(`${API_URL}/edit-profile`, formData, { headers: { Authorization: token, "Content-Type": "multipart/form-data" } }),
    getAllUsers: (token) => axios.get(`${API_URL}/get-all-user`, { headers: { Authorization: token } }),
    changePassword: (data, token) => axios.put(`${API_URL}/change-password`, data, { headers: { Authorization: token } }),
    updateUser: (userId, data, token) => axios.put(`${API_URL}/update-user/${userId}`, data, { headers: { Authorization: token } }),
    banUser: (id, token) => axios.put(`${API_URL}/banUser/${id}`, {}, { headers: { Authorization: token } }),
};

export default userAPI;