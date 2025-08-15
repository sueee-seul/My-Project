import { getUserWithUsername } from "../data/users-dao.js";        // Function to get user info from database
import { getUsernameFromJWT } from "../utils/jwt-utils.js";        // Function to extract username from JWT token

// Middleware to check if the request is from an authenticated user
export async function requiresAuthentication(req, res, next) {
  // If no auth token is present in cookies, return 401 Unauthorized
  if (!req.cookies.authToken) return res.sendStatus(401);

  try {
    const username = getUsernameFromJWT(req.cookies.authToken);    // Decode JWT to get username
    const user = await getUserWithUsername(username);              // Retrieve user from DB
    if (!user) return res.sendStatus(401);                         // If user not found, reject request

    req.user = user;                                               // Attach user to request for downstream use
    return next();                                                 // Proceed to next middleware or route
  } catch {
    return res.sendStatus(401);                                    // Catch token errors or DB issues
  }
}
