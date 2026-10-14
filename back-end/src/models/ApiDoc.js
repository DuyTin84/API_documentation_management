const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, default: "" },
    type: { type: String, default: "string" },
    required: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    statusCode: { type: Number, required: true, default: 200 },
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
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      default: "",
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
    },
    tag: {
      type: String,
      default: "General",
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "deprecated"],
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
      default: [{ statusCode: 200, description: "Successful response", body: {} }],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
