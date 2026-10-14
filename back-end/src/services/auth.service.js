const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { fail } = require("../utils/response");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async ({ name, email, password }) => {
  const normalizedName = name?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedName || !normalizedEmail || !password) {
    fail("Vui lòng nhập đầy đủ tên, email và mật khẩu");
  }

  if (normalizedName.length < 2 || normalizedName.length > 80) {
    fail("Tên phải có từ 2 đến 80 ký tự");
  }

  if (!emailRegex.test(normalizedEmail)) {
    fail("Email không đúng định dạng");
  }

  if (password.length < 6) {
    fail("Mật khẩu phải có ít nhất 6 ký tự");
  }

  const existedUser = await User.findOne({ email: normalizedEmail });
  if (existedUser) {
    fail("Email đã được đăng ký", 409);
  }

  const user = await User.create({ name: normalizedName, email: normalizedEmail, password });

  return {
    user: sanitizeUser(user),
    token: generateToken(user._id),
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    fail("Vui lòng nhập email và mật khẩu");
  }

  if (!emailRegex.test(normalizedEmail)) {
    fail("Email không đúng định dạng");
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await user.matchPassword(password))) {
    fail("Email hoặc mật khẩu không đúng", 401);
  }

  return {
    user: sanitizeUser(user),
    token: generateToken(user._id),
  };
};

module.exports = {
  register,
  login,
  sanitizeUser,
};
