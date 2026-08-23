import mongoose from "mongoose";

const contactMethodsSchema = new mongoose.Schema(
  {
    whatsapp: { type: String, default: "" },
    wechat: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const marketplaceItemSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      enum: ["Books", "Electronics", "Stationery", "Notes", "Others"],
    },

    condition: {
      type: String,
      enum: ["Like New", "Good", "Fair", "Swap"],
    },

    location: {
      type: String,
      trim: true,
    },

    courseCode: {
      type: String,
      index: true,
      default: null,
      uppercase: true,
    },

    images: {
      type: [String],
      default: [],
    },

    contactMethods: {
      type: contactMethodsSchema,
      default: () => ({
        whatsapp: "",
        wechat: "",
        email: "",
        phone: "",
      }),
    },

    status: {
      type: String,
      enum: ["draft", "live", "sold"],
      default: "live",
    },
  },
  { timestamps: true }
);

const MarketplaceItem = mongoose.model(
  "MarketplaceItem",
  marketplaceItemSchema
);

export default MarketplaceItem;