import Router from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Get all habits" });
});

router.get("/:id", (req, res) => {
  res.json({ message: `Get habit with ID ${req.params.id}` });
});

router.post("/", (req, res) => {
  res.status(201).json({ message: "Created a new habit" });
});

router.post("/:id/complete", (req, res) => {
  res.status(201).json({
    message: `Marked habit as complete for user with ID ${req.params.id}`,
  });
});

router.delete("/:id", (req, res) => {
  res.json({ message: `Deleted habit with ID ${req.params.id}` });
});

export default router;
