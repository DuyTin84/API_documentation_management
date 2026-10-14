const Project = require("../models/Project");
const ApiDoc = require("../models/ApiDoc");
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

const createProject = async (payload, userId) => {
  if (!payload.name) {
    fail("Project name is required");
  }

  return Project.create({
    name: payload.name,
    description: payload.description || "",
    baseUrl: payload.baseUrl || "",
    createdBy: userId,
  });
};

const getProject = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, createdBy: userId });
  if (!project) {
    fail("Project not found", 404);
  }

  return project;
};

const updateProject = async (projectId, payload, userId) => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, createdBy: userId },
    {
      name: payload.name,
      description: payload.description || "",
      baseUrl: payload.baseUrl || "",
    },
    { new: true, runValidators: true }
  );

  if (!project) {
    fail("Project not found", 404);
  }

  return project;
};

const deleteProject = async (projectId, userId) => {
  const project = await Project.findOneAndDelete({ _id: projectId, createdBy: userId });
  if (!project) {
    fail("Project not found", 404);
  }

  await ApiDoc.deleteMany({ projectId });
  return project;
};

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
};
