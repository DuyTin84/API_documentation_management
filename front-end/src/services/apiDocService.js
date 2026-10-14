import apiClient from "./apiClient";

export const getApiDocs = (projectId, params = {}) =>
  apiClient.get(`/projects/${projectId}/apis`, { params });

export const getApiDoc = (id) => apiClient.get(`/apis/${id}`);
export const createApiDoc = (projectId, payload) => apiClient.post(`/projects/${projectId}/apis`, payload);
export const updateApiDoc = (id, payload) => apiClient.put(`/apis/${id}`, payload);
export const deleteApiDoc = (id) => apiClient.delete(`/apis/${id}`);
