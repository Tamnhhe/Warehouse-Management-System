import unauthorApi from "./baseAPI/unauthorAPI";

const authAPI = {
  login: (credentials) =>
    unauthorApi
      .post("/authentication/login", credentials)
      .then((response) => response.data),
  register: (form) =>
    unauthorApi
      .post("/authentication/register", form)
      .then((response) => response.data),
  refreshToken: async () =>
    unauthorApi
      .post("/authentication/refresh")
      .then((response) => response.data),
  logout: async () =>
    unauthorApi
      .post("/authentication/logout")
      .then((response) => response.data),
  getCurrentUser: async () =>
    unauthorApi
      .get("/authentication/current-user")
      .then((response) => response.data),
};

export default authAPI;
