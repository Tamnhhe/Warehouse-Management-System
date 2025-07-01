import authorApi from "./baseAPI/authorAPI";
import formDataApi from "./baseAPI/formDataAPI";

const API_URL = "/products";

const productAPI = {
    getAll: () => authorApi.get(`${API_URL}/getAllProducts`),
    getById: (id) => authorApi.get(`${API_URL}/getProductById/${id}`),
    create: (formData) => formDataApi.post(`${API_URL}/createProduct`, formData),
    update: (id, formData) => formDataApi.put(`${API_URL}/updateProduct/${id}`, formData),
    inactivate: (id) => authorApi.put(`${API_URL}/inactivateProduct/${id}`),
    checkProductName: (name) => authorApi.get(`${API_URL}/checkProductName?name=${encodeURIComponent(name)}`),
};

export default productAPI;