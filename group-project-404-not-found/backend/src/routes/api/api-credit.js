import express from "express";
import { getCreditLogsByUserId } from "../../data/credit-dao.js";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";

const router = express.Router();

router.use(requiresAuthentication);

// GET /credit/history — paginated credit log for current user
router.get("/history", async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await getCreditLogsByUserId(req.user.id, page, limit);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch credit history" });
    }
});

export default router;
