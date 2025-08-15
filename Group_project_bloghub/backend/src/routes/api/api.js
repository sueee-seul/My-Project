import express from "express";

const router = express.Router();

import authRoutes from "./api-auth.js";
router.use("/", authRoutes);

//users
import userRoutes from "./api-users.js";
router.use("/users", userRoutes);
//comments
import commentRoutes from "./api-comments.js";
router.use("/comments", commentRoutes);

//articles
import articleRoutes from "./api-articles.js";
router.use("/articles", articleRoutes);

//likes
import likeRoutes from  "./api-likes.js";
router.use("/likes", likeRoutes);

//admin
import adminRoutes from "./api-admin.js";
router.use("/admin", adminRoutes);

//subscriptions
import subscriptionRoutes from "./api-subscriptions.js";
router.use("/subscriptions", subscriptionRoutes); 


//notifications
import notificationRoutes from "./api-notifications.js";
router.use("/notifications", notificationRoutes);

//upload
import uploadRoutes from './api-upload.js';
router.use("/upload", uploadRoutes);

export default router;
