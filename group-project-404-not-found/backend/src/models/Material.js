import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    courseCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
      uppercase: true,
    },

    year: {
      type: Number,
    },

    semester: {
      type: String,
      trim: true,
    },

    targetDepartment: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    fileType: {
      type: String,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileSize: {
      type: String,
    },

    downloadCost: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "live", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Material = mongoose.model("Material", materialSchema);

export default Material;