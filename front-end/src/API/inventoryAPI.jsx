import unauthorApi from "./baseAPI/unauthorAPI";
import authorApi from "./baseAPI/authorAPI";

const API_URL = "/inventory";

const inventoryAPI = {
  getLayout: () => unauthorApi.get(`${API_URL}/layout`),
  getAllInventories: () => unauthorApi.get(API_URL),
  // Thêm sản phẩm vào kệ (nhập hàng trực tiếp)
  addProductToShelf: (data) => authorApi.post(`${API_URL}/add-product`, data),
  // Xuất hàng từ kệ
  removeProductFromShelf: (data) =>
    authorApi.post(`${API_URL}/remove-product`, data),
  // Tự động phân bổ sản phẩm vào các kệ
  importAutoDistribute: (data) =>
    authorApi.post(`${API_URL}/import-auto`, data),
};

export default inventoryAPI;
