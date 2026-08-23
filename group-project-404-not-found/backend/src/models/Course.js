import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },

    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    instructorName: {
      type: String,
      default: "",
      trim: true,
    },

    instructorAvatar: {
      type: String,
      default: null,
    },

    department: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },

    level: {
      type: Number,
      default: null,
      index: true,
    },

    semester: {
      type: String,
      default: null,
      trim: true,
    },

    vacation: {
      type: String,
      default: null,
      trim: true,
    },

    seatsLeft: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      default: "Available",
      trim: true,
    },

    prerequisites: {
      type: String,
      default: "None",
      trim: true,
    },

    schedule: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;