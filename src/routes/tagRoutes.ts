import { Router } from "express";
import { authenticateToken } from "../middleware/auth.ts";
import { validateBody, validateParams } from "../middleware/validation.ts";
import {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
  getPopularTags,
} from "../controllers/tagController.ts";
import {
  createTagSchema,
  updateTagSchema,
  uuidSchema,
} from "../schemas/tags.ts";

const router = Router();
router.use(authenticateToken);

// CRUD Routes
router.get("/", getTags);
router.get("/popular", getPopularTags);
router.get("/:id", validateParams(uuidSchema), getTagById);
router.post("/", validateBody(createTagSchema), createTag);
router.put(
  "/:id",
  validateParams(uuidSchema),
  validateBody(updateTagSchema),
  updateTag,
);
router.delete("/:id", validateParams(uuidSchema), deleteTag);

export default router;
