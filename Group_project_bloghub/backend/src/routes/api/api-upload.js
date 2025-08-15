import express from "express";
import multer from "multer";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";

// Configure multer to temporarily store uploaded files in the "temp-images" folder
const upload = multer({ dest: "temp-images" });

const router = express.Router();

// POST /api/uploads/
// Upload a single image file, rename it, and move it to the public/images folder
router.post(
  "/",
  requiresAuthentication,                     // Ensure the user is authenticated
  upload.single("image-file"),                // Handle a single file upload with the field name "image-file"
  async (req, res) => {
    const originalname = req.file.originalname;                            // Get the original filename
    const fileExtension = originalname.substring(originalname.lastIndexOf(".")); // Extract the file extension
    const newFileName = uuid() + fileExtension;                            // Generate a new unique filename

    // Move and rename the uploaded file from temp folder to public/images
    fs.renameSync(req.file.path, `public/images/${newFileName}`);

    // Return the new image URL path
    const response = {
      imageUrl: `/images/${newFileName}`
    };

    return res.json(response); // Respond with the image URL
  }
);

export default router;
