import axios from "axios";
const API_URL = "http://localhost:9999/suppliers";

const supplierAPI = {
    getAll: () => axios.get(`${API_URL}/getAllSuppliers`),
    getList: () => axios.get(`${API_URL}/get-list-suppliers`),
    add: (data) => axios.post(`${API_URL}/addSupplier`, data),
    update: (id, data) => axios.put(`${API_URL}/updateSupplier/${id}`, data),
    updateStatus: (id, data) => axios.put(`${API_URL}/update-status/${id}`, data),
};

export default supplierAPI;