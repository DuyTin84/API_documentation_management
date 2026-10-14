const mongoose = require("mongoose");
const ApiDoc = require("../models/ApiDoc");
const Project = require("../models/Project");
const { fail } = require("../utils/response");

const VALID_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const VALID_STATUSES = ["draft", "published", "deprecated"];
const VALID_FIELD_TYPES = ["string", "number", "boolean", "object", "array"];

const ensureProjectOwner = async (projectId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    fail("Project không hợp lệ");
  }

  const project = await Project.findOne({ _id: projectId, createdBy: userId });
  if (!project) {
    fail("Không tìm thấy project", 404);
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
      fail("Nội dung JSON không hợp lệ");
    }
  }

  return value;
};

const normalizeFields = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && (item.key || item.value || item.description))
    .map((item) => ({
      key: item.key?.trim(),
      value: item.value || "",
      type: item.type || "string",
      required: Boolean(item.required),
      description: item.description?.trim() || "",
    }))
    .map((item) => {
      if (!item.key) {
        fail("Các field header/params phải có key");
      }

      if (item.key.length > 80) {
        fail("Key của header/params không được vượt quá 80 ký tự");
      }

      if (!VALID_FIELD_TYPES.includes(item.type)) {
        fail("Kiểu dữ liệu của header/params không hợp lệ");
      }

      if (item.description.length > 300) {
        fail("Mô tả field không được vượt quá 300 ký tự");
      }

      return item;
    });
};

const normalizeResponses = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [{ statusCode: 200, description: "Phản hồi thành công", body: {} }];
  }

  return items.filter(Boolean).map((item) => {
    const statusCode = Number(item.statusCode);
    const description = item.description?.trim() || "";

    if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
      fail("Status code của response phải nằm trong khoảng 100 đến 599");
    }

    if (description.length > 500) {
      fail("Mô tả response không được vượt quá 500 ký tự");
    }

    return {
      statusCode,
      description,
      body: normalizeJson(item.body, {}),
    };
  });
};

const buildApiPayload = (payload, userId, projectId) => {
  const name = payload.name?.trim();
  const description = payload.description?.trim() || "";
  const method = payload.method;
  const endpoint = payload.endpoint?.trim();
  const tag = payload.tag?.trim() || "General";
  const status = payload.status || "draft";

  if (!name || !method || !endpoint) {
    fail("Vui lòng nhập tên API, method và endpoint");
  }

  if (name.length < 2 || name.length > 160) {
    fail("Tên API phải có từ 2 đến 160 ký tự");
  }

  if (description.length > 1000) {
    fail("Mô tả API không được vượt quá 1000 ký tự");
  }

  if (!VALID_METHODS.includes(method)) {
    fail("Method không hợp lệ");
  }

  if (!endpoint.startsWith("/")) {
    fail("Endpoint phải bắt đầu bằng dấu /");
  }

  if (endpoint.length > 200) {
    fail("Endpoint không được vượt quá 200 ký tự");
  }

  if (tag.length > 80) {
    fail("Tag/module không được vượt quá 80 ký tự");
  }

  if (!VALID_STATUSES.includes(status)) {
    fail("Trạng thái API không hợp lệ");
  }

  return {
    projectId,
    name,
    description,
    method,
    endpoint,
    tag,
    status,
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
    fail("Không tìm thấy tài liệu API", 404);
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
