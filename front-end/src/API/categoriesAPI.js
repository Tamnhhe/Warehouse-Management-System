import authorApi from "./baseAPI/authorAPI";

const categoriesAPI = {
    getAll: () => authorApi.get('/categories/getAllCategories').then(response => response.data),
    getById: (id) => authorApi.get(`/categories/${id}`).then(response => response.data),
    create: (category) => authorApi.post('/categories', category).then(response => response.data),
    update: (id, category) => authorApi.put(`/categories/${id}`, category).then(response => response.data),
    delete: (id) => authorApi.delete(`/categories/${id}`).then(response => response.data),
};

export default categoriesAPI;