import authorApi from "./baseAPI/authorAPI";

const API_URL = "/branches";

const branchAPI = {
  getAll: () => authorApi.get(`${API_URL}/getAllBranches`),
  getById: (id) => authorApi.get(`${API_URL}/getBranchById/${id}`),
  create: (data) => authorApi.post(`${API_URL}/addBranch`, data),
  update: (id, data) => authorApi.put(`${API_URL}/updateBranch/${id}`, data),
  delete: (id) => authorApi.delete(`${API_URL}/deleteBranch/${id}`),
  updateStatus: (id, data) => authorApi.put(`${API_URL}/updateStatus/${id}`, data),
};

export default branchAPI;
