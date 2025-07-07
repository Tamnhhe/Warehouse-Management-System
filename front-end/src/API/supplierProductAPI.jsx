import authorApi from "./baseAPI/authorAPI";

const API_URL = "/supplier-products";

// Cache-busting utility
const addCacheBusting = (url) => {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_t=${Date.now()}&_r=${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

const supplierProductAPI = {
  getAll: () => {
    console.log(
      "[SupplierProductAPI] Fetching all supplier products with cache-busting..."
    );
    return authorApi.get(addCacheBusting(`${API_URL}/getAllSupplierProducts`), {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  },
  getProductsBySupplier: (supplierId) => {
    console.log(
      `[SupplierProductAPI] Fetching products for supplier ${supplierId} with cache-busting...`
    );
    return authorApi.get(
      addCacheBusting(`${API_URL}/supplier/${supplierId}/products`),
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  },
  getAvailableProductsForSupplier: (supplierId) =>
    authorApi.get(`${API_URL}/supplier/${supplierId}/available-products`),
  addProductToSupplier: (supplierId, data) =>
    authorApi.post(`${API_URL}/supplier/${supplierId}/add-product`, data),
  updateSupplierProduct: (supplierProductId, data) =>
    authorApi.put(`${API_URL}/supplier-product/${supplierProductId}`, data),
  removeProductFromSupplier: (supplierProductId) =>
    authorApi.delete(`${API_URL}/supplier-product/${supplierProductId}`),
  getSupplierStats: (supplierId) =>
    authorApi.get(`${API_URL}/supplier/${supplierId}/stats`),

  // Legacy endpoints (backward compatibility)
  create: (data) => authorApi.post(`${API_URL}/create`, data),
  update: (id, data) => authorApi.put(`${API_URL}/update/${id}`, data),
  delete: (id) => authorApi.delete(`${API_URL}/delete/${id}`),
  createSampleData: () => authorApi.post(`${API_URL}/create-sample-data`),
};

export default supplierProductAPI;
