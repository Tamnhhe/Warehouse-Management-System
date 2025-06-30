import axios from "axios";
const API_URL = "http://localhost:9999/supplierProducts";

const supplierProductAPI = {
    getAll: () => axios.get(`${API_URL}/getAllSupplierProducts`),
    getProductsBySupplier: (supplierId) => axios.get(`${API_URL}/getProductsBySupplier/${supplierId}`),
};

export default supplierProductAPI;