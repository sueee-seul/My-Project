import mongoose from "mongoose";

const unlockedMaterialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
      index: true,
    },

    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

unlockedMaterialSchema.index(
  { userId: 1, materialId: 1 },
  { unique: true }
);

const UnlockedMaterial = mongoose.model(
  "UnlockedMaterial",
  unlockedMaterialSchema
);

export default UnlockedMaterial;