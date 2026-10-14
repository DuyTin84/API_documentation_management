const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: [true, "Vui lòng nhập key"], trim: true, maxlength: [80, "Key không được vượt quá 80 ký tự"] },
    value: { type: String, default: "" },
    type: { type: String, enum: { values: ["string", "number", "boolean", "object", "array"], message: "Kiểu dữ liệu không hợp lệ" }, default: "string" },
    required: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    statusCode: { type: Number, required: [true, "Vui lòng nhập status code"], min: [100, "Status code phải từ 100 trở lên"], max: [599, "Status code không được vượt quá 599"], default: 200 },
    description: { type: String, default: "" },
    body: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const apiDocSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project là bắt buộc"],
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên API"],
      trim: true,
      minlength: [2, "Tên API phải có ít nhất 2 ký tự"],
      maxlength: [160, "Tên API không được vượt quá 160 ký tự"],
    },
    description: {
      type: String,
      default: "",
    },
    method: {
      type: String,
      enum: { values: ["GET", "POST", "PUT", "PATCH", "DELETE"], message: "Method không hợp lệ" },
      required: [true, "Vui lòng chọn method"],
    },
    endpoint: {
      type: String,
      required: [true, "Vui lòng nhập endpoint"],
      trim: true,
      maxlength: [200, "Endpoint không được vượt quá 200 ký tự"],
    },
    tag: {
      type: String,
      default: "General",
      trim: true,
    },
    status: {
      type: String,
      enum: { values: ["draft", "published", "deprecated"], message: "Trạng thái API không hợp lệ" },
      default: "draft",
    },
    headers: [fieldSchema],
    queryParams: [fieldSchema],
    pathParams: [fieldSchema],
    requestBody: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    responses: {
      type: [responseSchema],
      default: [{ statusCode: 200, description: "Phản hồi thành công", body: {} }],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người tạo là bắt buộc"],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

apiDocSchema.index({ projectId: 1, method: 1, endpoint: 1 }, { unique: true });
apiDocSchema.index({ name: "text", endpoint: "text", tag: "text" });

module.exports = mongoose.model("ApiDoc", apiDocSchema);
