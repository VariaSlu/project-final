import express from "express";
import Item from "../models/Item.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// list items for user
router.get("/", auth, async (req, res) => {
  const items = await Item.find({ userId: req.user.id }).lean();
  res.json(items);
});

// create
router.post("/", auth, async (req, res) => {
  const { childId, type, size, season, status, notes } = req.body;
  const item = await Item.create({ userId: req.user.id, childId, type, size, season, status, notes });
  res.status(201).json(item);
});

// update
router.patch("/:id", auth, async (req, res) => {
  const item = await Item.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// delete
router.delete("/:id", auth, async (req, res) => {
  const ok = await Item.deleteOne({ _id: req.params.id, userId: req.user.id });
  if (!ok.deletedCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;
