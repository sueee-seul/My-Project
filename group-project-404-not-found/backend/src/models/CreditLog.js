import mongoose from "mongoose";

const creditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["earn", "spend", "refund"],
      default: undefined,
    },

    relatedMaterialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      default: null,
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const CreditLog = mongoose.model("CreditLog", creditLogSchema);

export default CreditLog;