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
import validatePermissions from "../middleware/permissions.ts";

const router = Router();
router.use(authenticateToken);

// CRUD Routes
router.get("/", validatePermissions("tags:read"), getTags);
router.get("/popular", validatePermissions("tags:read"), getPopularTags);
router.get(
  "/:id",
  validateParams(uuidSchema),
  validatePermissions("tags:read"),
  getTagById,
);
router.post(
  "/",
  validateBody(createTagSchema),
  validatePermissions("tags:create"),
  createTag,
);
router.put(
  "/:id",
  validateParams(uuidSchema),
  validateBody(updateTagSchema),
  validatePermissions("tags:update"),
  updateTag,
);
router.delete(
  "/:id",
  validateParams(uuidSchema),
  validatePermissions("tags:delete"),
  deleteTag,
);

export default router;
