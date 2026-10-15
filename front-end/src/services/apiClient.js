import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
    const requestUrl = error.config?.url || "";
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (error.response?.status === 401 && localStorage.getItem("token") && !isAuthRequest) {
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized", { detail: { message } }));
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
