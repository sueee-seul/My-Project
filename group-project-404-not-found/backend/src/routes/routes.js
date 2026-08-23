import express from "express";

const router = express.Router();

/**
 * This route handler will respond to a GET request to the "/" path (e.g. http://localhost:3000/). It will
 * return an HTTP 200 (OK) response with the given JSON data.
 */

router.get("/", (req, res)=>{
    return res.json({message: "Welcome UoaSwap"});
})

/**
 * Add child routes
 */

import apiRoutes from "./api/api.js";
router.use("/", apiRoutes);

export default router;



