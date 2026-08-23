// Only for admin

import express from "express";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import { isAdmin } from "../../middleware/admin-middleware.js";
import { deleteMaterialsByUploaderId } from "../../data/material-dao.js";
import { deleteItemsBySellerId } from "../../data/marketplace-dao.js";
import { deleteUserById, updateCreditBalance } from "../../data/user-dao.js";
import User from "../../models/User.js";

import {
  deleteMaterialById,
  getMaterialByStatus,
  approveMaterial,
  rejectMaterial,
} from "../../data/material-dao.js";

import { deleteItemById } from "../../data/marketplace-dao.js";
import { createCourse, deleteCourseById, updateCourse } from "../../data/course-dao.js";
import { addCreditLog } from "../../data/credit-dao.js";

const router = express.Router();

router.use(requiresAuthentication);
router.use(isAdmin);

// ─── Users ────────────────────────────────────────────────────────────────────

router.get("/users", async (req, res) => {
  try {
    const safeUsers = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Delete all user-related data: materials, marketplace items, etc.
    await deleteMaterialsByUploaderId(userId);
    await deleteItemsBySellerId(userId);

    const success = await deleteUserById(userId);
    if (success) {
      console.log(`[Admin] ${req.user.email} deleted user: ${userId}`);
      return res.sendStatus(204);
    }

    return res.status(404).json({ error: "User not found" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error during deletion" });
  }
});

// ─── Materials ────────────────────────────────────────────────────────────────

router.get("/materials", async (req, res) => {
  try {
    const { status } = req.query;
    const list = status
      ? await getMaterialByStatus(status)
      : await getMaterialByStatus("pending");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

router.patch("/materials/:id/approve", async (req, res) => {
  try {
    const material = await approveMaterial(req.params.id);
    if (!material) return res.status(404).json({ error: "Material not found" });

    const UPLOAD_REWARD = 200;
    await updateCreditBalance(material.uploaderId, UPLOAD_REWARD);
    await addCreditLog({
      userId: material.uploaderId,
      amount: UPLOAD_REWARD,
      reason: `Material approved: ${material.title}`,
      type: "earn",
      relatedMaterialId: material.id,
    });

    res.json(material);
  } catch (err) {
    res.status(500).json({ error: "Failed to approve material" });
  }
});

router.patch("/materials/:id/reject", async (req, res) => {
  try {
    const material = await rejectMaterial(req.params.id);
    if (!material) return res.status(404).json({ error: "Material not found" });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: "Failed to reject material" });
  }
});

router.delete("/materials/:id", async (req, res) => {
  try {
    const success = await deleteMaterialById(req.params.id);
    if (success) return res.sendStatus(204);
    return res.status(404).json({ error: "Material not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete material" });
  }
});

// ─── Marketplace ──────────────────────────────────────────────────────────────

router.delete("/marketplace/:id", async (req, res) => {
  try {
    const success = await deleteItemById(req.params.id);
    if (success) return res.sendStatus(204);
    return res.status(404).json({ error: "Marketplace item not found" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error during marketplace deletion" });
  }
});

// ─── Courses ──────────────────────────────────────────────────────────────────

router.post("/course", async (req, res) => {
  try {
    const { courseCode, courseName } = req.body;
    if (!courseCode?.trim()) return res.status(400).json({ error: "Course code is required" });
    if (!courseName?.trim()) return res.status(400).json({ error: "Course name is required" });

    const newCourse = await createCourse(req.body);
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to create course" });
  }
});

router.patch("/course/:id", async (req, res) => {
  try {
    const updatedCourse = await updateCourse(req.params.id, req.body);
    if (updatedCourse) return res.json(updatedCourse);
    return res.status(404).json({ error: "Course not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update course" });
  }
});

router.delete("/course/:id", async (req, res) => {
  try {
    const success = await deleteCourseById(req.params.id);
    if (success) return res.sendStatus(204);
    return res.status(404).json({ error: "Course not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

export default router;
