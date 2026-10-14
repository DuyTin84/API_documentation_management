const mongoose = require("mongoose");
const ApiDoc = require("../models/ApiDoc");
const Project = require("../models/Project");
const { fail } = require("../utils/response");

const ensureProjectOwner = async (projectId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    fail("Invalid project id");
  }

  const project = await Project.findOne({ _id: projectId, createdBy: userId });
  if (!project) {
    fail("Project not found", 404);
  }

  return project;
};

const normalizeJson = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      fail("Invalid JSON content");
    }
  }

  return value;
};

const normalizeFields = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item.key)
    .map((item) => ({
      key: item.key,
      value: item.value || "",
      type: item.type || "string",
      required: Boolean(item.required),
      description: item.description || "",
    }));
};

const normalizeResponses = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [{ statusCode: 200, description: "Successful response", body: {} }];
  }

  return items.map((item) => ({
    statusCode: Number(item.statusCode) || 200,
    description: item.description || "",
    body: normalizeJson(item.body, {}),
  }));
};

const buildApiPayload = (payload, userId, projectId) => {
  if (!payload.name || !payload.method || !payload.endpoint) {
    fail("Name, method and endpoint are required");
  }

  return {
    projectId,
    name: payload.name,
    description: payload.description || "",
    method: payload.method,
    endpoint: payload.endpoint,
    tag: payload.tag || "General",
    status: payload.status || "draft",
    headers: normalizeFields(payload.headers),
    queryParams: normalizeFields(payload.queryParams),
    pathParams: normalizeFields(payload.pathParams),
    requestBody: normalizeJson(payload.requestBody, {}),
    responses: normalizeResponses(payload.responses),
    updatedBy: userId,
  };
};

const listApiDocs = async (projectId, filters, userId) => {
  await ensureProjectOwner(projectId, userId);

  const query = { projectId };
  if (filters.method) query.method = filters.method;
  if (filters.status) query.status = filters.status;
  if (filters.tag) query.tag = filters.tag;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { endpoint: { $regex: filters.search, $options: "i" } },
      { tag: { $regex: filters.search, $options: "i" } },
    ];
  }

  return ApiDoc.find(query).sort({ tag: 1, endpoint: 1 });
};

const getApiDoc = async (apiId, userId) => {
  const apiDoc = await ApiDoc.findById(apiId);
  if (!apiDoc) {
    fail("API documentation not found", 404);
  }

  await ensureProjectOwner(apiDoc.projectId, userId);
  return apiDoc;
};

const createApiDoc = async (projectId, payload, userId) => {
  await ensureProjectOwner(projectId, userId);

  return ApiDoc.create({
    ...buildApiPayload(payload, userId, projectId),
    createdBy: userId,
  });
};

const updateApiDoc = async (apiId, payload, userId) => {
  const existing = await getApiDoc(apiId, userId);
  const updated = await ApiDoc.findByIdAndUpdate(
    apiId,
    buildApiPayload(payload, userId, existing.projectId),
    { new: true, runValidators: true }
  );

  return updated;
};

const deleteApiDoc = async (apiId, userId) => {
  const apiDoc = await getApiDoc(apiId, userId);
  await ApiDoc.findByIdAndDelete(apiDoc._id);
  return apiDoc;
};

module.exports = {
  listApiDocs,
  getApiDoc,
  createApiDoc,
  updateApiDoc,
  deleteApiDoc,
};
