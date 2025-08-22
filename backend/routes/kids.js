import express from "express";
import Kid from "../models/Kid.js";
import auth from "../middlewares/auth.js"; // your JWT middleware

const router = express.Router();

// GET all kids for logged in user
router.get("/", auth, async (req, res) => {
  const kids = await Kid.find({ owner: req.user._id });
  res.json(kids);
});

// POST new kid
router.post("/", auth, async (req, res) => {
  const { name, birthdate } = req.body;
  const kid = new Kid({ name, birthdate, owner: req.user._id });
  await kid.save();
  res.status(201).json(kid);
});

export default router;
