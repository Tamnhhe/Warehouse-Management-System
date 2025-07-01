import authorApi from "./baseAPI/authorAPI";

const API_URL = "/inventoryTransactions";

const transactionAPI = {
    getAll: () => authorApi.get(`${API_URL}/getAllTransactions`),
    getById: (id) => authorApi.get(`${API_URL}/getTransactionById/${id}`),
    update: (id, data) => authorApi.put(`${API_URL}/updateTransaction/${id}`, data),
    updateStatus: (id, data) => authorApi.put(`${API_URL}/updateTransactionStatus/${id}`, data),
    create: (data) => authorApi.post(`${API_URL}/createTransaction`, data),
    createReceipt: (formData) => authorApi.post(`${API_URL}/create-receipts`, formData),
};

export default transactionAPI;