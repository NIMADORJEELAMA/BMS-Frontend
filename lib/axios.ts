import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Add a request interceptor to attach the token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // Force redirect
    }
    return Promise.reject(error);
  },
);

export default api;
