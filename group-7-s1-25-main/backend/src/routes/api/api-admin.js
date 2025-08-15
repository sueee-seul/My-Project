import express from "express";

import bcrypt from "bcrypt"; 
import { getDatabase } from "../../data/database.js"; 

import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import { requiresAdmin } from "../../middleware/admin-middleware.js";
import { getAllUsersWithArticleCount, deleteUserAndRelatedData } from "../../data/admin-dao.js";

const router = express.Router();

export default router;

//Create admin account to check it's function
router.post('/set-admin-password', requiresAuthentication, async (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) return res.status(400).json({ error: 'Missing fields' });

  const db = await getDatabase();
  const hashed = await bcrypt.hash(newPassword, 10);

  const result = await db.run(
    "UPDATE Users SET password = ?, is_admin = 1 WHERE username = ?",
    hashed,
    username
  );

  if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Admin password set successfully' });
});



//Admin : list up all users
router.get("/users", requiresAuthentication, requiresAdmin, async (req, res)=>{
    try {
      const users = await getAllUsersWithArticleCount();
      // return avatar_id
      res.status(200).json({ users });
    } catch (err) {
      console.error("Failed to list users:", err);
      res.sendStatus(500);
    }
});

//Admin : delete user
router.delete("/users/:id", requiresAuthentication,requiresAdmin, async (req,res) =>{
    try{
    await deleteUserAndRelatedData(req.params.id);
    res.sendStatus(204);
    }catch(error){
      console.error("Failed to delete user:", error);
      res.status(500).json({ error: "Failed to delete user and related data." });
    }
})