const mongoose = require("mongoose");
const Project = require("../models/Project");
const ApiDoc = require("../models/ApiDoc");
const buildOpenApiDocument = require("../templates/openapi.template");
const { fail } = require("../utils/response");

const listProjects = async (userId) => {
  const projects = await Project.find({ createdBy: userId }).sort({ updatedAt: -1 });

  const projectIds = projects.map((project) => project._id);
  const counts = await ApiDoc.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: "$projectId", totalApis: { $sum: 1 } } },
  ]);

  const countMap = counts.reduce((map, item) => {
    map[item._id.toString()] = item.totalApis;
    return map;
  }, {});

  return projects.map((project) => ({
    ...project.toObject(),
    totalApis: countMap[project._id.toString()] || 0,
  }));
};

const normalizeProjectPayload = (payload) => {
  const name = payload.name?.trim();
  const description = payload.description?.trim() || "";
  const baseUrl = payload.baseUrl?.trim() || "";

  if (!name) {
    fail("Vui lòng nhập tên project");
  }

  if (name.length < 2 || name.length > 120) {
    fail("Tên project phải có từ 2 đến 120 ký tự");
  }

  if (description.length > 500) {
    fail("Mô tả project không được vượt quá 500 ký tự");
  }

  if (baseUrl) {
    try {
      const parsedUrl = new URL(baseUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        fail("Base URL phải bắt đầu bằng http:// hoặc https://");
      }
    } catch (error) {
      fail("Base URL không đúng định dạng");
    }
  }

  return { name, description, baseUrl };
};

const createProject = async (payload, userId) => {
  const data = normalizeProjectPayload(payload);

  return Project.create({
    ...data,
    createdBy: userId,
  });
};

const getProject = async (projectId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    fail("Project không hợp lệ");
  }

  const project = await Project.findOne({ _id: projectId, createdBy: userId });
  if (!project) {
    fail("Không tìm thấy project", 404);
  }

  return project;
};

const updateProject = async (projectId, payload, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    fail("Project không hợp lệ");
  }

  const data = normalizeProjectPayload(payload);
  const project = await Project.findOneAndUpdate(
    { _id: projectId, createdBy: userId },
    data,
    { new: true, runValidators: true }
  );

  if (!project) {
    fail("Không tìm thấy project", 404);
  }

  return project;
};

const deleteProject = async (projectId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    fail("Project không hợp lệ");
  }

  const project = await Project.findOneAndDelete({ _id: projectId, createdBy: userId });
  if (!project) {
    fail("Không tìm thấy project", 404);
  }

  await ApiDoc.deleteMany({ projectId });
  return project;
};

const exportProjectOpenApi = async (projectId, userId) => {
  const project = await getProject(projectId, userId);
  const apiDocs = await ApiDoc.find({ projectId: project._id }).sort({ tag: 1, endpoint: 1, method: 1 });

  return buildOpenApiDocument(project, apiDocs);
};

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  exportProjectOpenApi,
};
