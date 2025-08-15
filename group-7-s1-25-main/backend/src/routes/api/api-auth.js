import express from "express";
import { createUser, getUserWithCredentials } from "../../data/users-dao.js";  // User data access functions
import { createUserJWT } from "../../utils/jwt-utils.js";                      // Function to generate JWT

const router = express.Router();  // Create a new router instance

// Login route: verify credentials, issue token, and set cookie
router.post("/login", async (req, res) => {
  const { username, password } = req.body;                     // Extract credentials from request body
  const user = await getUserWithCredentials(username, password); // Verify credentials
  if (!user) return res.sendStatus(401);                       // Unauthorized if user not found or invalid

  // Create JWT token for the user
  const jwtToken = createUserJWT(user.username);
  const expires = new Date(Date.now() + 86400000);             // Token expires in 24 hours

  // Return full user object (includes avatar info)
  return res
    .status(200)
    .cookie("authToken", jwtToken, { httpOnly: true, expires }) // Set token in httpOnly cookie
    .json({ user });                                            // Send user info in response
});

// Register route: create a new user in the database
router.put("/register", async (req, res) => {
  try {
    let result = await createUser(req.body);         // Attempt to create user from request body
    console.log(result);
    if (result > 0) {
      return res.sendStatus(201);                    // Created successfully
    } else {
      return res.sendStatus(400);                    // Bad request (creation failed)
    }
  } catch (err) {
    return res.status(400).json(err);                // Return validation or server errors
  }
});

// Logout route: clear the authToken cookie
router.post("/logout", (req, res) => {
  const expires = new Date(0);                       // Expire the cookie immediately
  return res
    .cookie("authToken", "", { httpOnly: true, expires }) // Clear the cookie
    .sendStatus(204);                                 // No content
});

export default router; // Export the router for use in main app
