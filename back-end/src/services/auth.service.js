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

const register = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    fail("Name, email and password are required");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    fail("Email is already registered", 409);
  }

  const user = await User.create({ name, email, password });

  return {
    user: sanitizeUser(user),
    token: generateToken(user._id),
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    fail("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    fail("Invalid email or password", 401);
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
