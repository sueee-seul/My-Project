import mongoose from "mongoose";
import MarketplaceItem from "../models/MarketplaceItem.js";

// ─── Helper ────────────────────────────────────────────────────────────────

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── Read ──────────────────────────────────────────────────────────────────

export async function getAllItems({
  search,
  category,
  condition,
  courseCode,
  minPrice,
  maxPrice,
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

  if (category) query.category = category;
  if (condition) query.condition = condition;

  if (courseCode) {
    query.courseCode = courseCode.trim().toUpperCase();
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};

    if (minPrice !== undefined && minPrice !== "") {
      query.price.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      query.price.$lte = Number(maxPrice);
    }
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    MarketplaceItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),

    MarketplaceItem.countDocuments(query),
  ]);

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
  };
}

// Get one item
export async function getItemById(id) {
  if (!isValidObjectId(id)) return null;
  return await MarketplaceItem.findById(id);
}

// Get seller items
export async function getItemBysellerId(sellerId) {
  if (!isValidObjectId(sellerId)) return [];

  return await MarketplaceItem.find({ sellerId }).sort({
    createdAt: -1,
  });
}

// Similar items
export async function getSimilarItems(
  itemId,
  category,
  courseCode,
  limit = 4
) {
  if (!isValidObjectId(itemId)) return [];

  return await MarketplaceItem.find({
    _id: { $ne: itemId },
    status: "live",
    $or: [
      { category },
      ...(courseCode ? [{ courseCode }] : []),
    ],
  })
    .sort({ createdAt: -1 })
    .limit(Number(limit));
}

// Recent listings by course
export async function getRecentListingsByCourse(
  courseCode,
  limit = 4
) {
  return await MarketplaceItem.find({
    courseCode: courseCode?.trim().toUpperCase(),
    status: "live",
  })
    .sort({ createdAt: -1 })
    .limit(Number(limit));
}

// ─── Create ────────────────────────────────────────────────────────────────

export async function createItem(data) {
  return await MarketplaceItem.create({
    sellerId: data.sellerId,

    title: data.title,
    description: data.description ?? "",

    price: Number(data.price) || 0,

    category: data.category ?? "Others",
    condition: data.condition ?? null,

    location: data.location ?? "",

    courseCode: data.courseCode
      ? data.courseCode.trim().toUpperCase()
      : null,

    images: data.images ?? [],

    contactMethods: data.contactMethods ?? {
      whatsapp: "",
      wechat: "",
      email: "",
      phone: "",
    },

    status: data.status === "live" ? "live" : "draft",
  });
}

// ─── Update ────────────────────────────────────────────────────────────────

export async function updateItemById(id, data) {
  if (!isValidObjectId(id)) return null;

  const allowedFields = [
    "title",
    "description",
    "price",
    "category",
    "condition",
    "location",
    "courseCode",
    "images",
    "contactMethods",
    "status",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  if (updates.price !== undefined && updates.price !== "") {
    updates.price = Number(updates.price);
  }

  if (updates.courseCode) {
    updates.courseCode =
      updates.courseCode.trim().toUpperCase();
  }

  return await MarketplaceItem.findByIdAndUpdate(
    id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );
}

// ─── Delete ────────────────────────────────────────────────────────────────

export async function deleteItemById(id) {
  if (!isValidObjectId(id)) return false;

  const result =
    await MarketplaceItem.findByIdAndDelete(id);

  return !!result;
}

export async function deleteItemsBySellerId(
  sellerId
) {
  if (!isValidObjectId(sellerId)) return false;

  await MarketplaceItem.deleteMany({ sellerId });

  return true;
}