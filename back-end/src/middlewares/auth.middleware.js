const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Vui lòng đăng nhập để tiếp tục");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      const error = new Error("Không tìm thấy người dùng");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      error.message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn";
    }
    next(error);
  }
};

module.exports = {
  protect,
};
