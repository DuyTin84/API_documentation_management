const apiService = require("../services/api.service");
const { success } = require("../utils/response");

const listApiDocs = async (req, res, next) => {
  try {
    const apis = await apiService.listApiDocs(req.params.projectId, req.query, req.user._id);
    success(res, apis);
  } catch (error) {
    next(error);
  }
};

const getApiDoc = async (req, res, next) => {
  try {
    const apiDoc = await apiService.getApiDoc(req.params.id, req.user._id);
    success(res, apiDoc);
  } catch (error) {
    next(error);
  }
};

const createApiDoc = async (req, res, next) => {
  try {
    const apiDoc = await apiService.createApiDoc(req.params.projectId, req.body, req.user._id);
    success(res, apiDoc, "API documentation created", 201);
  } catch (error) {
    next(error);
  }
};

const updateApiDoc = async (req, res, next) => {
  try {
    const apiDoc = await apiService.updateApiDoc(req.params.id, req.body, req.user._id);
    success(res, apiDoc, "API documentation updated");
  } catch (error) {
    next(error);
  }
};

const deleteApiDoc = async (req, res, next) => {
  try {
    await apiService.deleteApiDoc(req.params.id, req.user._id);
    success(res, null, "API documentation deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listApiDocs,
  getApiDoc,
  createApiDoc,
  updateApiDoc,
  deleteApiDoc,
};
