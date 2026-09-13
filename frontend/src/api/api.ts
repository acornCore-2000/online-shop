import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL:apiUrl,
  withCredentials: true,
});

let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/refresh" &&
      originalRequest.url !== "/api/login"
    ) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          await api.post("/api/refresh");

          isRefreshing = false;

          return api(originalRequest);
        }
      } catch (refreshError) {
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      console.log("API Error:", error.response.status);
    }

    return Promise.reject(error);
  }
);

export default api;