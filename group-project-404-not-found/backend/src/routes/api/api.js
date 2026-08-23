import express from "express";

const router = express.Router();

//Authentication
import authRoutes from "./api-auth.js";
router.use("/", authRoutes);

//admin
import adminRoutes from "./api-admin.js";
router.use("/admin", adminRoutes);

//My Profile
import myProfileRoutes from "./api-me.js";
router.use("/me", myProfileRoutes);

//Marketplace
import marketRoutes from "./api-marketplace.js";
router.use("/marketplace", marketRoutes);

//Material
import materialRoutes from "./api-material.js";
router.use("/material", materialRoutes);

//Course
import courseRoutes from "./api-course.js";
router.use("/course", courseRoutes);

//Credit
import creditRoutes from "./api-credit.js";
router.use("/credit", creditRoutes);

//Files (GridFS)
import filesRoutes from "./api-files.js";
router.use("/files", filesRoutes);

export default router;

