import axios from "axios";

// 強制使用 127.0.0.1 避開 Windows localhost 解析問題
const API_URL = "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
