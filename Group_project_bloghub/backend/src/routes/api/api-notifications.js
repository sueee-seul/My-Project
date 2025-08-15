import express from "express";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import {
  getNotificationById,
  getNotifications,
  seenNotification
} from "../../data/notifications-dao.js";

const router = express.Router(); // Create a new router instance

// GET /api/notifications/
// Return all notifications for the authenticated user
router.get("/", requiresAuthentication, async (req, res) => {
  return res.status(200).json(await getNotifications(req.user.id));
});

// POST /api/notifications/:id
// Mark a specific notification as seen
router.post("/:id", requiresAuthentication, async (req, res) => {
  const notification = await getNotificationById(req.params.id);

  // Check if the notification belongs to the current user
  if (notification.user_id != req.user.id) {
    return res.sendStatus(403); // Forbidden
  }

  await seenNotification(req.params.id); // Mark notification as seen
  return res.sendStatus(204); // No content
});

export default router;
