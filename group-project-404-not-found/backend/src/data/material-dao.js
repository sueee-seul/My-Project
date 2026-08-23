import mongoose from "mongoose";
import Material from "../models/Material.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getMaterialById(id) {
  if (!isValidObjectId(id)) return null;
  return await Material.findById(id);
}

export async function getMaterialByUploaderId(uploaderId) {
  if (!isValidObjectId(uploaderId)) return [];
  return await Material.find({ uploaderId }).sort({ createdAt: -1 });
}

export async function getMaterialFiltered({
  search,
  courseCode,
  year,
  level,
  semester,
  type,
  department,
  page = 1,
  limit = 20,
  includeAll = false,
} = {}) {
  const query = {};

  if (!includeAll) {
    query.status = "live";
  }

  if (search) {
    const q = search.trim();
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { courseCode: { $regex: q, $options: "i" } },
    ];
  }

  if (courseCode) {
    query.courseCode = courseCode.trim().toUpperCase();
  }

  if (year) {
    query.year = parseInt(year);
  }

  if (semester) {
    query.semester = { $regex: `^${semester}$`, $options: "i" };
  }

  if (type) {
    query.fileType = { $regex: `^${type}$`, $options: "i" };
  }

  if (department) {
    query.targetDepartment = { $regex: `^${department}$`, $options: "i" };
  }

  // Only apply level filtering when courseCode is not already specified.
  // Example: COMPSCI732 -> 700 level.
  if (level && !courseCode) {
    const lvl = parseInt(level);
    const firstDigit = Math.floor(lvl / 100);

    if (!Number.isNaN(firstDigit)) {
      query.courseCode = {
        $regex: new RegExp(`^[A-Z]+${firstDigit}`),
      };
    }
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Material.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Material.countDocuments(query),
  ]);

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
  };
}

export async function getMaterialByStatus(status) {
  return await Material.find({ status }).sort({ createdAt: -1 });
}

export async function getRecentMaterialsByCourse(courseCode, limit = 3) {
  return await Material.find({
    courseCode: courseCode?.trim().toUpperCase(),
    status: "live",
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit) || 3);
}

// ─── Create / Update / Delete ────────────────────────────────────────────────

export async function createMaterial(data) {
  return await Material.create({
    uploaderId: data.uploaderId,
    title: data.title,
    courseCode: data.courseCode?.trim().toUpperCase(),
    year:
      data.year !== undefined && data.year !== ""
        ? parseInt(data.year)
        : undefined,
    semester: data.semester ?? null,
    targetDepartment: data.targetDepartment ?? null,
    description: data.description ?? "",
    fileType: data.fileType ?? null,
    fileUrl: data.fileUrl,
    fileSize: data.fileSize ?? null,
    downloadCost:
      data.downloadCost !== undefined && data.downloadCost !== ""
        ? parseInt(data.downloadCost)
        : 500,
    status: "pending",
  });
}

export async function updateMaterialById(id, data) {
  if (!isValidObjectId(id)) return null;

  const allowedFields = [
    "title",
    "courseCode",
    "year",
    "semester",
    "targetDepartment",
    "description",
    "fileType",
    "downloadCost",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  if (updates.courseCode) {
    updates.courseCode = updates.courseCode.trim().toUpperCase();
  }

  if (updates.year !== undefined) {
    if (updates.year === "") {
      delete updates.year;
    } else {
      updates.year = parseInt(updates.year);
    }
  }

  if (updates.downloadCost !== undefined) {
    if (updates.downloadCost === "") {
      delete updates.downloadCost;
    } else {
      updates.downloadCost = parseInt(updates.downloadCost);
    }
  }

  return await Material.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
}

export async function approveMaterial(id) {
  if (!isValidObjectId(id)) return null;

  return await Material.findByIdAndUpdate(
    id,
    { status: "live" },
    {
      new: true,
      runValidators: true,
    }
  );
}

export async function rejectMaterial(id) {
  if (!isValidObjectId(id)) return null;

  return await Material.findByIdAndUpdate(
    id,
    { status: "rejected" },
    {
      new: true,
      runValidators: true,
    }
  );
}

export async function deleteMaterialById(id) {
  if (!isValidObjectId(id)) return false;

  const result = await Material.findByIdAndDelete(id);
  return !!result;
}

export async function deleteMaterialsByUploaderId(uploaderId) {
  if (!isValidObjectId(uploaderId)) return false;

  await Material.deleteMany({ uploaderId });
  return true;
}

// Kept for backward compat
export async function getAllMaterials() {
  return await Material.find().sort({ createdAt: -1 });
}