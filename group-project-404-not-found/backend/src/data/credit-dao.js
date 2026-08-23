import mongoose from "mongoose";
import CreditLog from "../models/CreditLog.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getCreditLogsByUserId(userId, page = 1, limit = 20) {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;

  if (!isValidObjectId(userId)) {
    return {
      items: [],
      total: 0,
      page: pageNum,
      limit: limitNum,
    };
  }

  const skip = (pageNum - 1) * limitNum;
  const query = { userId };

  const [items, total] = await Promise.all([
    CreditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    CreditLog.countDocuments(query),
  ]);

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
  };
}

export async function getCreditLogById(id) {
  if (!isValidObjectId(id)) return null;
  return await CreditLog.findById(id);
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function addCreditLog({
  userId,
  amount,
  reason,
  type,
  relatedMaterialId,
  note,
}) {
  if (!isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount)) {
    throw new Error("Invalid amount");
  }

  return await CreditLog.create({
    userId,
    amount: parsedAmount,
    reason,
    type: type ?? undefined,
    relatedMaterialId:
      relatedMaterialId && isValidObjectId(relatedMaterialId)
        ? relatedMaterialId
        : null,
    note: note ?? "",
  });
}

// ─── Delete (optional admin use) ────────────────────────────────────────────

export async function deleteCreditLogById(id) {
  if (!isValidObjectId(id)) return false;

  const result = await CreditLog.findByIdAndDelete(id);
  return !!result;
}

// ─── Backward compat ────────────────────────────────────────────────────────

export async function getAllCreditLogs() {
  return await CreditLog.find().sort({ createdAt: -1 });
}