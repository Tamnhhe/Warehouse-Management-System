import axios from "axios";
const API_URL = "http://localhost:9999/inventoryTransactions";

const transactionAPI = {
    getAll: () => axios.get(`${API_URL}/getAllTransactions`),
    getById: (id) => axios.get(`${API_URL}/getTransactionById/${id}`),
    update: (id, data) => axios.put(`${API_URL}/updateTransaction/${id}`, data),
    updateStatus: (id, data) => axios.put(`${API_URL}/updateTransactionStatus/${id}`, data),
    create: (data) => axios.post(`${API_URL}/createTransaction`, data),
    createReceipt: (data) => axios.post(`${API_URL}/create-receipts`, data),
};

export default transactionAPI;