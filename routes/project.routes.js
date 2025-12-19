import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  submitProject,
  getMyProjects
} from "../controllers/project.controller.js";

const router = express.Router();

router.post("/", authMiddleware, submitProject);
router.get("/my", authMiddleware, getMyProjects);

export default router;
