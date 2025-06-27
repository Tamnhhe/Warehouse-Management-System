import axios from "axios";
const API_URL = "http://localhost:9999/categories";

const categoryAPI = {
    getAll: () => axios.get(`${API_URL}/getAllCategories`),
    add: (data) => axios.post(`${API_URL}/addCategory`, data),
    update: (id, data) => axios.put(`${API_URL}/updateCategory/${id}`, data),
    inactivate: (id) => axios.put(`${API_URL}/inactivateCategory/${id}`),
    addSub: (categoryId, data) => axios.post(`${API_URL}/${categoryId}/sub/add`, data),
    updateSub: (categoryId, subId, data) => axios.put(`${API_URL}/${categoryId}/sub/update/${subId}`, data),
    deleteSub: (categoryId, subId) => axios.delete(`${API_URL}/${categoryId}/sub/delete/${subId}`),
};

export default categoryAPI;