const projectService = require("../services/project.service");
const { success } = require("../utils/response");

const listProjects = async (req, res, next) => {
  try {
    const projects = await projectService.listProjects(req.user._id);
    success(res, projects);
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user._id);
    success(res, project, "Project created", 201);
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProject(req.params.id, req.user._id);
    success(res, project);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user._id);
    success(res, project, "Project updated");
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user._id);
    success(res, null, "Project deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
};
