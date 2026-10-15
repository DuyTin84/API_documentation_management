export const parseJsonInput = (value, fieldName = "Nội dung") => {
  try {
    return JSON.parse(value || "{}");
  } catch {
    throw new Error(`${fieldName} phải là JSON hợp lệ`);
  }
};
