// Middleware to restrict access to admin users only
export function requiresAdmin(req, res, next) {
    // If the user is not logged in or not an admin, return 403 Forbidden
    if (!req.user?.is_admin) return res.sendStatus(403);

    // If the user is an admin, proceed to the next middleware or route handler
    next();
}
