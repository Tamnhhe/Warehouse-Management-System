import authorApi from "./baseAPI/authorAPI";

const API_URL = "/supplierProducts";

const supplierProductAPI = {
    getAll: () => authorApi.get(`${API_URL}/getAllSupplierProducts`),
    getProductsBySupplier: (supplierId) => authorApi.get(`${API_URL}/getProductsBySupplier/${supplierId}`),
};

export default supplierProductAPI;