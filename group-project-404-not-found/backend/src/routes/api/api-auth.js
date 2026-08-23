import express from "express";
import mongoose from "mongoose"; 
import bcrypt from "bcrypt"; 
import {
  findUserByEmail,
  verifyUserPassword,
  createUser,
} from "../../data/user-dao.js";
import { createUserJWT } from "../../utils/jwt-utils.js";
import { addCreditLog } from "../../data/credit-dao.js";
import User from "../../models/User.js";

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";

// POST /register
router.post("/register", async (req, res) => {
  try {
    const { email, password, upi, phone } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!upi?.trim()) {
      return res.status(400).json({ error: "UPI is required" });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const phoneRegex = /^[0-9\-\+]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number. Only numbers are allowed." });
    }

    const emailLower = email.trim().toLowerCase();
    if (!emailLower.endsWith("@aucklanduni.ac.nz") && !emailLower.endsWith("@auckland.ac.nz")) {
      return res.status(400).json({ error: "Please use your University of Auckland email address to sign up." });
    }

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Directly encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: emailLower,
      email: emailLower,
      password: hashedPassword,
      upi,
      phone,
      isVerified: true, 
      creditBalance: 0,
    });

    // Get 1,000 points straight away
    await addCreditLog({
      userId: user._id,
      amount: 1000,
      reason: "Welcome bonus",
      type: "earn",
    });
    user.creditBalance += 1000;
    await user.save();

    // ✅ Returns the token directly; login successful
    const token = createUserJWT(user.email);
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      message: "Registration successful",
      user: safeUser,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(400).json({ error: "Registration failed", details: err.message });
  }
});


/**
 * final step of the registration process: user submits the code they received via email.
 * If the code is correct, we mark the user as verified and complete the registration by giving them the welcome bonus and returning the JWT.
 */
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email?.trim() || !code?.trim()) {
      return res.status(400).json({ error: "Invalid code or email." });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(400).json({ error: "Invalid code or email." });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      verificationCode: code,
      isVerified: false 
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid code or email." });
    }

    //Approve sign up
    user.isVerified = true;
    user.verificationCode = null; 
    await user.save();


    // Give 1000 welcome bonus immediately
    await addCreditLog({
      userId: user._id,
      amount: 1000,
      reason: "Welcome bonus",
      type: "earn",
    });

    user.creditBalance = (user.creditBalance || 0) + 1000;
    await user.save();

    const token = createUserJWT(user.email);

    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({ message: "Registered", user: safeUser });
  } catch (err) {
    res.status(400).json({ error: "Failed to register", details: err.message });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const verifiedUser = await User.findOne({ email: email.toLowerCase(), isVerified: true });
    if (!verifiedUser) {
      return res.status(401).json({ error: "Email not verified. Please check your inbox for the verification code." });
    }

    const valid = await verifyUserPassword(user, password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createUserJWT(user.email);

    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ message: "Logged in", user: safeUser });
  } catch (err) {
    res.status(500).json({ error: "Failed to login", details: err.message });
  }
});

// POST /logout
router.post("/logout", (req, res) => {
  res.cookie("authToken", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });

  return res.sendStatus(204);
});

export default router;