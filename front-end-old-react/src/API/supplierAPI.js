import authorApi from "./baseAPI/authorAPI";

const API_URL = "/suppliers";

const supplierAPI = {
    getAll: () => authorApi.get(`${API_URL}/getAllSuppliers`),
    getList: () => authorApi.get(`${API_URL}/get-list-suppliers`),
    add: (data) => authorApi.post(`${API_URL}/addSupplier`, data),
    update: (id, data) => authorApi.put(`${API_URL}/updateSupplier/${id}`, data),
    updateStatus: (id, data) => authorApi.put(`${API_URL}/update-status/${id}`, data),
};

export default supplierAPI;