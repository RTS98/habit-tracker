import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Get all users" });
});

router.get("/:id", (req, res) => {
  res.json({ message: `Get user with ID ${req.params.id}` });
});

router.post("/", (req, res) => {
  res.status(201).json({ message: "Created a new user" });
});

router.put("/:id", (req, res) => {
  res.json({ message: `Updated user with ID ${req.params.id}` });
});

router.delete("/:id", (req, res) => {
  res.json({ message: `Deleted user with ID ${req.params.id}` });
});

export default router;
