import express from "express";
import {
  getAllCourses,
  getCourseById,
  getCourseBySearch,
} from "../../data/course-dao.js";
import { getRecentMaterialsByCourse } from "../../data/material-dao.js";
import { getRecentListingsByCourse } from "../../data/marketplace-dao.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search, department, level, semester } = req.query;
    const list = await getAllCourses({ search, department, level, semester });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load courses" });
  }
});

router.get("/:id/details", async (req, res) => {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const [recentMaterials, recentListings] = await Promise.all([
      getRecentMaterialsByCourse(course.courseCode, 3),
      getRecentListingsByCourse(course.courseCode, 4),
    ]);

    res.json({ course, recentMaterials, recentListings });
  } catch (err) {
    res.status(500).json({ error: "Failed to load course details" });
  }
});

router.get("/:code", async (req, res) => {
  try {
    const results = await getCourseBySearch(req.params.code);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error searching course" });
  }
});

export default router;