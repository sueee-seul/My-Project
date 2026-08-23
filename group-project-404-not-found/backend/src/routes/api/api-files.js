import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// GET /api/files/:filename
router.get("/:filename", async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    const filename = req.params.filename;

    // Find the file to get its content type and length
    const files = await bucket.find({ filename }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "File not found in cloud database" });
    }

    const file = files[0];

    // Set headers for download / display
    res.set("Content-Type", file.contentType || "application/octet-stream");
    res.set("Content-Length", file.length);
    
    // Suggest filename for downloading
    const originalName = file.filename.split('_').slice(1).join('_'); // Removes prefix
    res.set("Content-Disposition", `inline; filename="${originalName}"`);

    // Stream it to the client
    const downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("GridFS Stream Error:", err);
      res.status(500).end();
    });
  } catch (err) {
    console.error("File Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch file from cloud" });
  }
});

export default router;
