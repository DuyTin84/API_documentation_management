import apiClient from "./apiClient";

export const login = (payload) => apiClient.post("/auth/login", payload);
export const register = (payload) => apiClient.post("/auth/register", payload);
export const getMe = () => apiClient.get("/auth/me");
