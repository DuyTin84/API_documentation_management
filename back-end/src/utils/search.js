const MAX_SEARCH_LENGTH = 100;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildLiteralSearchPattern = (value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value !== "string") {
    const error = new Error("Từ khóa tìm kiếm không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  const normalizedValue = value.trim();
  if (normalizedValue.length > MAX_SEARCH_LENGTH) {
    const error = new Error(`Từ khóa tìm kiếm không được vượt quá ${MAX_SEARCH_LENGTH} ký tự`);
    error.statusCode = 400;
    throw error;
  }

  return escapeRegex(normalizedValue);
};

module.exports = {
  MAX_SEARCH_LENGTH,
  buildLiteralSearchPattern,
  escapeRegex,
};
