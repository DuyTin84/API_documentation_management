const authService = require("../services/auth.service");
const { success } = require("../utils/response");

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    success(res, data, "Registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    success(res, data, "Logged in successfully");
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  success(res, authService.sanitizeUser(req.user));
};

module.exports = {
  register,
  login,
  me,
};
