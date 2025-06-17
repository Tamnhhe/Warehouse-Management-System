import authAPI from "./authAPI";

const transactionAPI = {
    getAll: () => authAPI.get('/transactions').then(response => response.data),
    getById: (id) => authAPI.get(`/transactions/${id}`).then(response => response.data),
    create: (transaction) => authAPI.post('/transactions', transaction).then(response => response.data),
    update: (id, transaction) => authAPI.put(`/transactions/${id}`, transaction).then(response => response.data),
    delete: (id) => authAPI.delete(`/transactions/${id}`).then(response => response.data),
};

export default transactionAPI;