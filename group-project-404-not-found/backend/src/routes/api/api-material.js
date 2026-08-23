import express from "express";
import {
  getAllMaterials,
  createMaterial,
  getMaterialFiltered,
  getMaterialById,
} from "../../data/material-dao.js";

import { requiresAuthentication } from "../../middleware/auth-middleware.js";

import {
  isUnlocked,
  unlockMaterial,
} from "../../data/unlocked-materials-dao.js";

import { updateCreditBalance } from "../../data/user-dao.js";
import { addCreditLog } from "../../data/credit-dao.js";

import {
  uploadMaterial,
  filePathToUrl,
  humanFileSize,
} from "../../middleware/upload-middleware.js";

const router = express.Router();

// GET /material
router.get("/", async (req, res) => {
  try {
    const {
      search,
      courseCode,
      year,
      level,
      semester,
      type,
      department,
      page,
      limit,
    } = req.query;

    const result = await getMaterialFiltered({
      search,
      courseCode,
      year,
      level,
      semester,
      type,
      department,
      page,
      limit,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

// GET /material/:id
router.get("/:id", async (req, res) => {
  try {
    const material = await getMaterialById(req.params.id);

    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.json(material);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch material" });
  }
});

// POST /material
router.post("/", requiresAuthentication, (req, res) => {
  uploadMaterial(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const {
        title,
        courseCode,
        year,
        semester,
        targetDepartment,
        description,
        downloadCost,
      } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({ error: "Title is required" });
      }

      if (!courseCode?.trim()) {
        return res.status(400).json({ error: "Course code is required" });
      }

      const fileUrl = req.file
        ? filePathToUrl(req.file)
        : null;

      const fileSize = req.file
        ? humanFileSize(req.file.size)
        : null;

      const fileType = req.file
        ? req.file.originalname
            .split(".")
            .pop()
            .toLowerCase()
        : req.body.fileType;

      const newMaterial = await createMaterial({
        title,
        courseCode,
        year,
        semester,
        targetDepartment,
        description,
        fileType,
        fileUrl,
        fileSize,
        downloadCost,
        uploaderId: req.user.id,
      });

      res.status(201).json(newMaterial);
    } catch (err) {
      res.status(400).json({
        error: err.message || "Failed to upload material",
      });
    }
  });
});

// POST /material/:id/download
router.post(
  "/:id/download",
  requiresAuthentication,
  async (req, res) => {
    try {
      const materialId = req.params.id;

      const material = await getMaterialById(materialId);

      if (!material) {
        return res.status(404).json({
          error: "Material not found",
        });
      }

      if (material.status !== "live") {
        return res.status(404).json({
          error: "Material not available",
        });
      }

      const alreadyUnlocked = await isUnlocked(
        req.user.id,
        materialId
      );

      if (alreadyUnlocked) {
        return res.json({
          fileUrl: material.fileUrl,
        });
      }

      const cost = material.downloadCost ?? 500;
      const balance = req.user.creditBalance ?? 0;

      if (balance < cost) {
        return res.status(402).json({
          error: "Insufficient credits",
          required: cost,
          available: balance,
        });
      }

      await updateCreditBalance(req.user.id, -cost);

      await addCreditLog({
        userId: req.user.id,
        amount: -cost,
        reason: `Downloaded: ${material.title}`,
        type: "spend",
        relatedMaterialId: material.id,
      });

      await unlockMaterial(req.user.id, materialId);

      res.json({
        fileUrl: material.fileUrl,
      });
    } catch (err) {
      console.error("Download error:", err);

      res.status(500).json({
        error: "Failed to process download",
      });
    }
  }
);

export default router;