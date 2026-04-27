import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getMe } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);

export default router;