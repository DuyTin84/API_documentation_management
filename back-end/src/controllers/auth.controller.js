const authService = require("../services/auth.service");
const { success } = require("../utils/response");

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    success(res, data, "Đăng ký thành công", 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    success(res, data, "Đăng nhập thành công");
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
