const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy đường dẫn - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi máy chủ";

  if (err.code === 11000) {
    statusCode = 409;
    message = "Dữ liệu này đã tồn tại";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "ID không hợp lệ";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Dữ liệu JSON gửi lên không hợp lệ";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
