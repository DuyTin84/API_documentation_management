const mongoose = require("mongoose");
const ApiDoc = require("../models/ApiDoc");
const Project = require("../models/Project");
const { fail } = require("../utils/response");
const { buildLiteralSearchPattern } = require("../utils/search");
const { getPathParameterKeys } = require("../utils/endpointPath");

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

  const statusCodes = new Set();

  return items.filter(Boolean).map((item) => {
    const statusCode = Number(item.statusCode);
    const description = item.description?.trim() || "";

    if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
      fail("Status code của response phải nằm trong khoảng 100 đến 599");
    }

    if (statusCodes.has(statusCode)) {
      fail(`Status code ${statusCode} đã được khai báo`);
    }
    statusCodes.add(statusCode);

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

  if (/[?#]/.test(endpoint)) {
    fail("Endpoint không được chứa query string hoặc fragment; hãy dùng Query Params");
  }

  if (tag.length > 80) {
    fail("Tag/module không được vượt quá 80 ký tự");
  }

  if (!VALID_STATUSES.includes(status)) {
    fail("Trạng thái API không hợp lệ");
  }

  const pathKeys = getPathParameterKeys(endpoint);
  if (new Set(pathKeys).size !== pathKeys.length) {
    fail("Path Params trong endpoint không được trùng tên");
  }

  const providedPathParams = normalizeFields(payload.pathParams);
  if (new Set(providedPathParams.map((item) => item.key)).size !== providedPathParams.length) {
    fail("Path Params không được trùng key");
  }
  const unusedPathParam = providedPathParams.find((item) => !pathKeys.includes(item.key));
  if (unusedPathParam) {
    fail(`Path Param ${unusedPathParam.key} không có trong endpoint`);
  }

  const pathParams = pathKeys.map((key) => ({
    ...(providedPathParams.find((item) => item.key === key) || {
      key,
      value: "",
      type: "string",
      description: "",
    }),
    required: true,
  }));

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
    pathParams,
    requestBody: normalizeJson(payload.requestBody, {}),
    responses: normalizeResponses(payload.responses),
    updatedBy: userId,
  };
};

const listApiDocs = async (projectId, filters, userId) => {
  await ensureProjectOwner(projectId, userId);

  const query = { projectId };
  if (filters.method) {
    if (!VALID_METHODS.includes(filters.method)) {
      fail("Method lọc không hợp lệ");
    }
    query.method = filters.method;
  }
  if (filters.status) {
    if (!VALID_STATUSES.includes(filters.status)) {
      fail("Trạng thái lọc không hợp lệ");
    }
    query.status = filters.status;
  }
  if (filters.tag) {
    if (typeof filters.tag !== "string" || filters.tag.length > 80) {
      fail("Tag lọc không hợp lệ");
    }
    query.tag = filters.tag;
  }

  const searchPattern = buildLiteralSearchPattern(filters.search);
  if (searchPattern) {
    query.$or = [
      { name: { $regex: searchPattern, $options: "i" } },
      { endpoint: { $regex: searchPattern, $options: "i" } },
      { tag: { $regex: searchPattern, $options: "i" } },
    ];
  }

  return ApiDoc.find(query).sort({ tag: 1, endpoint: 1 });
};

const getApiDoc = async (projectId, apiId, userId) => {
  await ensureProjectOwner(projectId, userId);

  if (!mongoose.Types.ObjectId.isValid(apiId)) {
    fail("Tài liệu API không hợp lệ");
  }

  const apiDoc = await ApiDoc.findOne({ _id: apiId, projectId });
  if (!apiDoc) {
    fail("Không tìm thấy tài liệu API", 404);
  }

  return apiDoc;
};

const createApiDoc = async (projectId, payload, userId) => {
  await ensureProjectOwner(projectId, userId);

  return ApiDoc.create({
    ...buildApiPayload(payload, userId, projectId),
    createdBy: userId,
  });
};

const updateApiDoc = async (projectId, apiId, payload, userId) => {
  const existing = await getApiDoc(projectId, apiId, userId);
  const updated = await ApiDoc.findOneAndUpdate(
    { _id: apiId, projectId: existing.projectId },
    buildApiPayload(payload, userId, existing.projectId),
    { new: true, runValidators: true }
  );

  if (!updated) {
    fail("Không tìm thấy tài liệu API", 404);
  }

  return updated;
};

const deleteApiDoc = async (projectId, apiId, userId) => {
  const apiDoc = await getApiDoc(projectId, apiId, userId);
  const deleted = await ApiDoc.findOneAndDelete({ _id: apiDoc._id, projectId });
  if (!deleted) {
    fail("Không tìm thấy tài liệu API", 404);
  }
  return apiDoc;
};

module.exports = {
  listApiDocs,
  getApiDoc,
  createApiDoc,
  updateApiDoc,
  deleteApiDoc,
};
