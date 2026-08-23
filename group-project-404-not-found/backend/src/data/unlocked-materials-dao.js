import mongoose from "mongoose";
import UnlockedMaterial from "../models/UnlockedMaterial.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── Read ────────────────────────────────────────────────────────────────────

// Check if a user has already unlocked a material
export async function isUnlocked(userId, materialId) {
  if (!isValidObjectId(userId) || !isValidObjectId(materialId)) {
    return false;
  }

  const record = await UnlockedMaterial.findOne({
    userId,
    materialId,
  });

  return !!record;
}

// Get all unlocked materials for one user
export async function getUnlockedMaterialsByUserId(userId) {
  if (!isValidObjectId(userId)) return [];

  return await UnlockedMaterial.find({ userId }).sort({
    unlockedAt: -1,
  });
}

// Get all users who unlocked one material
export async function getUnlocksByMaterialId(materialId) {
  if (!isValidObjectId(materialId)) return [];

  return await UnlockedMaterial.find({ materialId }).sort({
    unlockedAt: -1,
  });
}

// ─── Create ──────────────────────────────────────────────────────────────────

// Record a new unlock
export async function unlockMaterial(userId, materialId) {
  if (!isValidObjectId(userId) || !isValidObjectId(materialId)) {
    throw new Error("Invalid userId or materialId");
  }

  try {
    return await UnlockedMaterial.findOneAndUpdate(
      { userId, materialId },
      {
        $setOnInsert: {
          userId,
          materialId,
          unlockedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
  } catch (err) {
    throw err;
  }
}

// ─── Delete (optional admin use) ────────────────────────────────────────────

export async function removeUnlock(userId, materialId) {
  if (!isValidObjectId(userId) || !isValidObjectId(materialId)) {
    return false;
  }

  const result = await UnlockedMaterial.findOneAndDelete({
    userId,
    materialId,
  });

  return !!result;
}

// ─── Backward compat ────────────────────────────────────────────────────────

export async function getAllUnlockedMaterials() {
  return await UnlockedMaterial.find().sort({
    unlockedAt: -1,
  });
}