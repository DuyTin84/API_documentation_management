import apiClient from "./apiClient";

export const getProjects = () => apiClient.get("/projects");
export const createProject = (payload) => apiClient.post("/projects", payload);
export const getProject = (id) => apiClient.get(`/projects/${id}`);
export const updateProject = (id, payload) => apiClient.put(`/projects/${id}`, payload);
export const deleteProject = (id) => apiClient.delete(`/projects/${id}`);
