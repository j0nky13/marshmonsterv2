import express from "express";
import { getUsers, updateUser } from "../controllers/users.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", requireRole("admin"), getUsers);
router.patch("/:id", requireRole("admin"), updateUser);

export default router;