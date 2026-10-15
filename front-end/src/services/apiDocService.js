import apiClient from "./apiClient";

export const getApiDocs = (projectId, params = {}) =>
  apiClient.get(`/projects/${projectId}/apis`, { params });

export const getApiDoc = (projectId, id) => apiClient.get(`/projects/${projectId}/apis/${id}`);
export const createApiDoc = (projectId, payload) => apiClient.post(`/projects/${projectId}/apis`, payload);
export const updateApiDoc = (projectId, id, payload) => apiClient.put(`/projects/${projectId}/apis/${id}`, payload);
export const deleteApiDoc = (projectId, id) => apiClient.delete(`/projects/${projectId}/apis/${id}`);
