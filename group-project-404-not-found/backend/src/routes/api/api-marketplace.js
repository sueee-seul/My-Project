import express from "express";
import {
  getAllItems,
  createItem,
  getItemById,
  getSimilarItems,
  deleteItemById,
  updateItemById,
} from "../../data/marketplace-dao.js";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import { isValidObjectId } from "mongoose";
import { isAdmin } from "../../middleware/admin-middleware.js";
import {
  uploadMarketplaceImages,
  filePathToUrl,
} from "../../middleware/upload-middleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      courseCode,
      condition,
      minPrice,
      maxPrice,
      page,
      limit,
    } = req.query;

    const result = await getAllItems({
      search,
      category,
      courseCode,
      condition,
      minPrice,
      maxPrice,
      page,
      limit,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch marketplace listings" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await getItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

router.get("/:id/similar", async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await getItemById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const similar = await getSimilarItems(
      itemId,
      item.category,
      item.courseCode
    );

    res.json(similar);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch similar listings" });
  }
});

router.post("/", requiresAuthentication, (req, res) => {
  uploadMarketplaceImages(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const {
        title,
        price,
        category,
        description,
        condition,
        location,
        courseCode,
        contactMethods,
        status,
      } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({ error: "Title is required" });
      }

      if (price === undefined || parseFloat(price) < 0) {
        return res.status(400).json({ error: "Valid price is required" });
      }

      const images = (req.files || []).map((f) => filePathToUrl(f));

      let parsedContact = {};
      if (contactMethods) {
        try {
          parsedContact =
            typeof contactMethods === "string"
              ? JSON.parse(contactMethods)
              : contactMethods;
        } catch {
          return res.status(400).json({
            error: "contactMethods must be a valid JSON string",
          });
        }
      }

      const newItem = await createItem({
        title,
        price,
        category,
        description,
        condition,
        location,
        courseCode,
        contactMethods: parsedContact,
        images,
        status,
        sellerId: req.user.id,
      });

      res.status(201).json(newItem);
    } catch (err) {
      res.status(500).json({
        error: err.message || "Failed to create listing",
      });
    }
  });
});

router.patch("/:id", requiresAuthentication, (req, res) => {
  uploadMarketplaceImages(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    try {
      const itemId = req.params.id;
      const item = await getItemById(itemId);

      if (!item) {
        return res.status(404).json({ error: "Listing not found" });
      }

      const isOwner = item.sellerId.toString() === req.user.id;
      const isAdminUser = req.user.is_admin === 1;

      if (!isOwner && !isAdminUser) {
        return res.status(403).json({ error: "Unauthorized to edit this listing" });
      }

      const {
        title,
        price,
        category,
        description,
        condition,
        location,
        courseCode,
        contactMethods,
        status,
      } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({ error: "Title is required" });
      }
      if (price === undefined || isNaN(price) || Number(price) < 0) {
        return res.status(400).json({ error: "Valid price is required" });
      }

      const images = (req.files || []).map((f) => filePathToUrl(f.path));

      let parsedContact = {};
      if (contactMethods) {
        try {
          parsedContact = typeof contactMethods === "string"
            ? JSON.parse(contactMethods)
            : contactMethods;
        } catch {
          return res.status(400).json({
            error: "contactMethods must be a valid JSON string",
          });
        } 
      }
      else {
        parsedContact = item.contactMethods;
      } 
      
      const updatedItem = await updateItemById(itemId, {
        title,
        price,
        category,
        description,
        condition,
        location,
        courseCode,
        contactMethods: parsedContact,
        status,
        images: images.length > 0 ? images : undefined, // Only update if new images are uploaded
      });
      if (updatedItem) return res.json(updatedItem);
      return res.status(404).json({ error: "Listing not found after update" });
    } catch (err) {
      res.status(500).json({
        error: err.message || "Failed to update listing",
      });
    }
  });
});

router.delete("/:id", requiresAuthentication, async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await getItemById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const isOwner = item.sellerId.toString() === req.user.id;
    const isAdminUser = req.user.is_admin === 1;

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ error: "Unauthorized to delete this listing" });
    }

    const success = await deleteItemById(itemId);
    if (success) return res.status(204).json({ message: "Listing deleted successfully" });

    return res.status(404).json({ error: "Listing not found during deletion" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete listing" });
  }
});


export default router;
