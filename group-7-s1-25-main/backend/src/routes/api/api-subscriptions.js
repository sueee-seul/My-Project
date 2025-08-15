import express from "express";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import {
  checkSubscribed,
  getSubscribers,
  newSubscription,
  removeSubscription
} from "../../data/subs-dao.js";
import { getDatabase } from "../../data/database.js"; // Used to perform direct DB queries

const router = express.Router();

// 1. Check if the current user is subscribed to the target user
router.get("/status/:id", requiresAuthentication, async (req, res) => {
  let subscribed = await checkSubscribed(req.user.id, req.params.id);
  return res.status(200).json({ subscribed });
});

// 2. Get all authors that the current user is subscribed to
router.get("/me", requiresAuthentication, async (req, res) => {
  try {
    const db = await getDatabase();
    const rows = await db.all(
      `SELECT Users.id, Users.username, Users.firstname, Users.lastname
       FROM Subscriptions
       JOIN Users ON Subscriptions.recipient_id = Users.id
       WHERE Subscriptions.subscriber_id = ?`,
      [req.user.id]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Failed to fetch subscriptions", err);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// 3. Subscribe the current user to the target user
router.post("/:id", requiresAuthentication, async (req, res) => {
  try {
    const result = await newSubscription(req.user.id, req.params.id);
    if (result) return res.sendStatus(201); // Created
    return res.sendStatus(400); // Already subscribed or bad input
  } catch (err) {
    return res.status(400).json(err);
  }
});

// 4. Unsubscribe the current user from the target user
router.delete("/:id", requiresAuthentication, async (req, res) => {
  await removeSubscription(req.user.id, req.params.id);
  return res.sendStatus(204); // No content
});

// 5. Get all subscribers of the specified user (e.g. for author profile page)
router.get("/:id", async (req, res) => {
  const result = await getSubscribers(req.params.id);
  return res.status(200).json(result);
});

export default router;
