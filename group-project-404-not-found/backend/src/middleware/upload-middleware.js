import multer from "multer";
import path from "path";
import mongoose from "mongoose";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3001";

// ─── Custom GridFS Storage Engine ──────────────────────────────────────────────
class GridFSStorageEngine {
    _handleFile(req, file, cb) {
        if (!mongoose.connection.db) {
            return cb(new Error("Database not connected"));
        }
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
        const ext = path.extname(file.originalname).toLowerCase();
        
        // Use a prefix based on the fieldname to keep naming similar
        let prefix = "file";
        if (file.fieldname === "avatar") prefix = "avatar";
        if (file.fieldname === "images") prefix = "item";
        if (file.fieldname === "file") prefix = "mat";
        
        const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;
        
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.mimetype
        });
        
        file.stream.pipe(uploadStream)
            .on('error', cb)
            .on('finish', () => {
                cb(null, {
                    filename: filename,
                    id: uploadStream.id,
                    size: uploadStream.length
                });
            });
    }

    _removeFile(req, file, cb) {
        if (!mongoose.connection.db) return cb(null);
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
        bucket.delete(file.id, cb);
    }
}

const cloudStorage = new GridFSStorageEngine();

// ─── Avatar upload ────────────────────────────────────────────────────────────

const avatarFilter = (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only jpg, png, gif images are allowed for avatar"), false);
    }
};

export const uploadAvatar = multer({
    storage: cloudStorage,
    fileFilter: avatarFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ─── Material file upload ─────────────────────────────────────────────────────

const materialFilter = (req, file, cb) => {
    const allowed = [".pdf", ".docx", ".doc", ".pptx", ".ppt", ".mp4", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type"), false);
    }
};

export const uploadMaterial = multer({
    storage: cloudStorage,
    fileFilter: materialFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).single("file");

// ─── Marketplace images upload ────────────────────────────────────────────────

const imageFilter = (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed for marketplace listings"), false);
    }
};

export const uploadMarketplaceImages = multer({
    storage: cloudStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
}).array("images", 6); // max 6 images

// ─── Helper: convert disk path → absolute URL ─────────────────────────────────
export function filePathToUrl(file) {
    return `${BASE_URL}/files/${file.filename}`;
}

// ─── Helper: human-readable file size ────────────────────────────────────────
export function humanFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
