import express from "express";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import { getArticlesByUserId } from "../../data/article-dao.js";
import { getUserById, getUsersPublic, updateUser } from "../../data/users-dao.js";
import { getLikesByUserId } from "../../data/like-dao.js";
import { getCommentsByUserId } from "../../data/comments-dao.js";
import { getNotifications } from "../../data/notifications-dao.js";
import { deleteUserAndRelatedData } from "../../data/admin-dao.js";

const router = express.Router();

// Get the current logged-in user's full profile with their articles
router.get("/me", requiresAuthentication, async (req, res) => {
  try {
    const userId = req.user.id;
    const articles = await getArticlesByUserId(userId);

    const user = { ...req.user }; // Create a shallow copy of the user to avoid mutating session
    user.articles = articles;

    // Attach avatar URL if available
    if (user.avatar_id) {
      user.avatar = `http://localhost:3000/images/${user.avatar_id}.jpg`;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to get user's articles" });
  }
});

// Get all articles posted by a specific user by ID
router.get("/:id/articles", async (req, res) => {
  try {
    const userId = req.params.id;
    const articles = await getArticlesByUserId(userId);
    res.status(200).json({ articles });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to get user's articles" });
  }
});

// Get a public list of all users
router.get("/", async (req, res) => {
  let users = await getUsersPublic();
  return res.status(200).json(users);
});

// Update the current user's profile (partial update)
router.patch("/me", requiresAuthentication, async (req, res) => {
  try {
    const result = await updateUser(req.user.id, req.body);
    if (!result) return res.sendStatus(404); // User not found
    return res.sendStatus(204);              // No content, update successful
  } catch (err) {
    return res.status(422).json(err.errors); // Validation error
  }
});

// Get a user by ID (public info)
router.get("/:id", async (req, res) => {
  let id = parseInt(req.params.id);
  let user = await getUserById(id);
  return res.json(user);
});

// Delete a user and all related data (only admin or self)
router.delete("/:id", requiresAuthentication, async (req, res) => {
  const id = parseInt(req.params.id);

  // Prevent non-admins from deleting others
  if (req.user.id === id || req.user.is_admin === 1) {
    try {
      const success = await deleteUserAndRelatedData(id);
      if (success) {
        return res.sendStatus(200);
      } else {
        return res.status(404).json({ error: "User not found or already deleted." });
      }
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: "Failed to delete user." });
    }
  } else {
    return res.sendStatus(403); // Forbidden
  }
});

// Get all activity for the current user (articles, likes, comments, notifications)
router.get("/me/manage", requiresAuthentication, async (req, res) => {
  try {
    const userId = req.user.id;

    const [articles, likes, comments, notifications] = await Promise.all([
      getArticlesByUserId(userId),
      getLikesByUserId(userId),
      getCommentsByUserId(userId),
      getNotifications(userId)
    ]);

    res.status(200).json({
      articles,
      likes,
      comments,
      notifications
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to load user activity" });
  }
});

export default router;
