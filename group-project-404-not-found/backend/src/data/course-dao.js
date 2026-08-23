import mongoose from "mongoose";
import Course from "../models/Course.js";

export async function getCourseById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Course.findById(id);
}

export async function getAllCourses({ search, department, level, semester } = {}) {
  const query = {};
  const andConditions = [];

  if (search) {
    const q = search.trim();
    andConditions.push({
      $or: [
        { courseCode: { $regex: q, $options: "i" } },
        { courseName: { $regex: q, $options: "i" } },
        { instructorName: { $regex: q, $options: "i" } },
      ],
    });
  }

  if (department) {
    andConditions.push({ department: { $regex: department, $options: "i" } });
  }

  if (level) {
    andConditions.push({ level: parseInt(level) });
  }

  if (semester) {
    andConditions.push({
      $or: [
        { semester: { $regex: semester, $options: "i" } },
        { vacation: { $regex: semester, $options: "i" } },
      ],
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  return await Course.find(query).sort({ courseCode: 1 });
}

export async function getCourseBySearch(query) {
  const searchTerm = query?.trim() ?? "";

  return await Course.find({
    $or: [
      { courseCode: { $regex: `^${searchTerm}`, $options: "i" } },
      { courseName: { $regex: searchTerm, $options: "i" } },
    ],
  }).sort({ courseCode: 1 });
}

export async function createCourse(data) {
  const newCourse = {
    courseCode: data.courseCode,
    courseName: data.courseName,
    description: data.description ?? "",
    instructorName: data.instructorName ?? "",
    instructorAvatar: data.instructorAvatar ?? null,
    level: data.level ? parseInt(data.level) : null,
    semester: data.semester ?? null,
    department: data.department ?? null,
    seatsLeft: data.seatsLeft ? parseInt(data.seatsLeft) : null,
    status: data.status ?? "Available",
    prerequisites: data.prerequisites ?? "None",
    schedule: data.schedule ?? null,
  };

  return await Course.create(newCourse);
}

export async function updateCourse(id, updatedData) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const allowedFields = [
    "courseName",
    "description",
    "instructorName",
    "instructorAvatar",
    "level",
    "semester",
    "department",
    "seatsLeft",
    "status",
    "prerequisites",
    "schedule",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (updatedData[field] !== undefined) {
      updates[field] = updatedData[field];
    }
  }

  if (updates.level !== undefined && updates.level !== null) {
    updates.level = parseInt(updates.level);
  }

  if (updates.seatsLeft !== undefined && updates.seatsLeft !== null) {
    updates.seatsLeft = parseInt(updates.seatsLeft);
  }

  return await Course.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
}

export async function deleteCourseById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;

  const result = await Course.findByIdAndDelete(id);
  return !!result;
}