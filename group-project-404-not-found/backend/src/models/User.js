import mongoose from "mongoose";

const notifPrefsSchema = new mongoose.Schema(
  {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },

    upi: { type: String, required: true, unique: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },

    password: { type: String, required: true },

    bio: { type: String, default: "" },
    phone: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    dob: { type: String, default: null },

    avatarUrl: { type: String, default: "" },

    notifPrefs: {
      type: notifPrefsSchema,
      default: () => ({
        email: true,
        push: false,
        sms: false,
      }),
    },

    creditBalance: { type: Number, default: 0 },

    // Keep the same field name as current backend DAO.
    // 0 = normal user, 1 = admin
    is_admin: { type: Number, enum: [0, 1], default: 0 },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;