import axios from "axios";
const API_URL = "http://localhost:9999/products";

const productAPI = {
    getAll: () => axios.get(`${API_URL}/getAllProducts`),
    getById: (id) => axios.get(`${API_URL}/getProductById/${id}`),
    create: (formData) => axios.post(`${API_URL}/createProduct`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
    update: (id, formData) => axios.put(`${API_URL}/updateProduct/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
    inactivate: (id) => axios.put(`${API_URL}/inactivateProduct/${id}`),
    checkProductName: (name) => axios.get(`${API_URL}/checkProductName?name=${encodeURIComponent(name)}`),
};

export default productAPI;