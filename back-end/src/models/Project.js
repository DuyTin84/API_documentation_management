const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên project"],
      trim: true,
      minlength: [2, "Tên project phải có ít nhất 2 ký tự"],
      maxlength: [120, "Tên project không được vượt quá 120 ký tự"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Mô tả project không được vượt quá 500 ký tự"],
    },
    baseUrl: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
