import authorApi from "./baseAPI/authorAPI";

const API_URL = "/supplierProduct";

const supplierProductAPI = {
  getAll: () => {
    return authorApi.get(`${API_URL}/getAllSupplierProducts`);
  },
  getProductsBySupplier: (supplierId) => {
    return authorApi.get(`${API_URL}/getProductsBySupplier/${supplierId}`);
  },
  create: (data) => authorApi.post(`${API_URL}/create`, data),
  update: (id, data) => authorApi.put(`${API_URL}/update/${id}`, data),
  delete: (id) => authorApi.delete(`${API_URL}/delete/${id}`),
};

export default supplierProductAPI;
