import express from "express";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import {
  deleteUserById,
  updateMyProfile,
  changePassword,
  verifyUserPassword,
} from "../../data/user-dao.js";
import {
  getMaterialById,
  deleteMaterialById,
  updateMaterialById,
  getMaterialByUploaderId,
  deleteMaterialsByUploaderId,
} from "../../data/material-dao.js";
import {
  getItemBysellerId,
  updateItemById,
  deleteItemById,
  getItemById,
  deleteItemsBySellerId,
} from "../../data/marketplace-dao.js";
import { uploadAvatar, filePathToUrl } from "../../middleware/upload-middleware.js";

const router = express.Router();

router.use(requiresAuthentication);

function safeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

function sameId(a, b) {
  return a?.toString() === b?.toString();
}

// ─── Profile ──────────────────────────────────────────────────────────────────

router.get("/", async (req, res) => {
  res.json(safeUser(req.user));
});

router.patch("/", async (req, res) => {
  try {
    const updated = await updateMyProfile(req.user.id, req.body);
    if (!updated) return res.sendStatus(404);
    res.json(safeUser(updated));
  } catch (err) {
    res.status(400).json({ error: err.message || "Update failed" });
  }
});

router.patch("/password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: "currentPassword and newPassword are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: "New password must be at least 6 characters",
    });
  }

  const valid = await verifyUserPassword(req.user, currentPassword);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  await changePassword(req.user.id, newPassword);
  res.json({ message: "Password updated successfully" });
});

router.patch("/avatar", (req, res) => {
  uploadAvatar.single("avatar")(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No avatar file uploaded" });
      }

      const avatarUrl = filePathToUrl(req.file);
      const updated = await updateMyProfile(req.user.id, { avatarUrl });

      if (!updated) return res.sendStatus(404);

      res.json({ avatarUrl, user: safeUser(updated) });
    } catch (err) {
      res.status(500).json({ error: "Failed to upload avatar" });
    }
  });
});

router.delete("/", async (req, res) => {
  try {
    await deleteMaterialsByUploaderId(req.user.id);
    await deleteItemsBySellerId(req.user.id);

    const success = await deleteUserById(req.user.id);

    if (success) {
      res.clearCookie("authToken");
      return res.sendStatus(204);
    }

    return res.sendStatus(404);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// ─── My Materials ──────────────────────────────────────────────────────────────

router.get("/material", async (req, res) => {
  try {
    const all = await getMaterialByUploaderId(req.user.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const total = all.length;
    const items = all.slice((page - 1) * limit, page * limit);

    res.json({ items, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your materials" });
  }
});

router.delete("/material/:id", async (req, res) => {
  const materialId = req.params.id;
  const material = await getMaterialById(materialId);

  if (!material) return res.status(404).json({ error: "Material not found" });

  if (!sameId(material.uploaderId, req.user.id)) {
    return res.status(403).json({
      error: "You can only delete your own materials",
    });
  }

  await deleteMaterialById(materialId);
  res.sendStatus(204);
});

router.patch("/material/:id", async (req, res) => {
  const materialId = req.params.id;
  const material = await getMaterialById(materialId);

  if (!material) return res.status(404).json({ error: "Material not found" });

  if (!sameId(material.uploaderId, req.user.id)) {
    return res.status(403).json({
      error: "You can only update your own materials",
    });
  }

  try {
    const updated = await updateMaterialById(materialId, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
});

// ─── My Marketplace Items ──────────────────────────────────────────────────────

router.get("/marketplace", async (req, res) => {
  try {
    const all = await getItemBysellerId(req.user.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const total = all.length;
    const items = all.slice((page - 1) * limit, page * limit);

    res.json({ items, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your marketplace items" });
  }
});

router.patch("/marketplace/:id", async (req, res) => {
  const itemId = req.params.id;
  const item = await getItemById(itemId);

  if (!item) return res.status(404).json({ error: "Item not found" });

  if (!sameId(item.sellerId, req.user.id)) {
    return res.status(403).json({
      error: "You can only update your own items",
    });
  }

  try {
    const updated = await updateItemById(itemId, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
});

router.delete("/marketplace/:id", async (req, res) => {
  const itemId = req.params.id;
  const item = await getItemById(itemId);

  if (!item) return res.status(404).json({ error: "Item not found" });

  if (!sameId(item.sellerId, req.user.id)) {
    return res.status(403).json({
      error: "You can only delete your own items",
    });
  }

  const success = await deleteItemById(itemId);

  if (success) res.sendStatus(204);
  else res.status(500).json({ error: "Delete failed" });
});

export default router;