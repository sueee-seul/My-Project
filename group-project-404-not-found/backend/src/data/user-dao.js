// For user and admin

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";

// Backward compatibility for old admin route
export let users = [];

// ─── Finders ────────────────────────────────────────────────────────────────

export async function findUserById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await User.findById(id);
}

export async function findUserByUsername(username) {
  return await User.findOne({ username: username?.trim() });
}

export async function findUserByEmail(email) {
  const normalizedEmail = email?.trim().toLowerCase();
  return await User.findOne({ email: normalizedEmail });
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function createUser(data) {
  const email = data.email?.trim().toLowerCase();
  if (!email) throw new Error("Email is required");
  if (!data.password) throw new Error("Password is required");

  if (await findUserByEmail(email)) {
    throw new Error("Email already exists");
  }

  const username = data.username?.trim() || email.split("@")[0];

  if (await findUserByUsername(username)) {
    throw new Error("Username already exists");
  }

  const BASE_URL = process.env.BASE_URL ?? "http://localhost:3001";
  const defaultAssets = ["Asset 2.png", "Asset 3.png", "Asset 4.png", "Asset 6.png", "Asset 7.png"];
  const randomAsset = defaultAssets[Math.floor(Math.random() * defaultAssets.length)];
  const assetName = data.avatarId ? defaultAssets[(data.avatarId - 1) % defaultAssets.length] : randomAsset;

  return await User.create({
    username,
    upi: data.upi?.trim() || undefined,
    email,
    firstname: data.firstname ?? username,
    lastname: data.lastname ?? "",
    bio: data.bio ?? "",
    phone: data.phone?.trim() || undefined,
    description: data.description ?? "",
    dob: data.dob ?? undefined,
    avatarUrl: `${BASE_URL}/images/${assetName}`,
    notifPrefs: data.notifPrefs ?? {
      email: true,
      push: false,
      sms: false,
    },
    password: bcrypt.hashSync(data.password, 10),
    creditBalance: 1000,
    is_admin: 0,
    isVerified: false,
    verificationCode: data.verificationCode,
  });
}

export async function verifyUserPassword(user, password) {
  return bcrypt.compare(password, user.password);
}

// ─── Profile Updates ─────────────────────────────────────────────────────────

export async function updateMyProfile(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const allowedFields = [
    "username",
    "firstname",
    "lastname",
    "bio",
    "phone",
    "upi",
    "dob",
    "notifPrefs",
    "avatarUrl",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  return await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
}

export async function changePassword(id, newPassword) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  const user = await User.findByIdAndUpdate(
    id,
    { password: hashedPassword },
    { new: true }
  );

  return !!user;
}

// ─── Credit ──────────────────────────────────────────────────────────────────

export async function updateCreditBalance(userId, delta) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { creditBalance: delta } },
    { new: true }
  );

  return user ? user.creditBalance : null;
}

// ─── Deletion ────────────────────────────────────────────────────────────────

export async function deleteUserById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;

  const result = await User.findByIdAndDelete(id);
  return !!result;
}
