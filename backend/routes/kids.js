import express from "express";
import auth from "../middlewares/auth.js";
import Kid from "../models/Kid.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const kids = await Kid.find({ owner: req.user.id }).lean();
    res.json(kids);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch kids" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, birthdate } = req.body;
    const kid = await Kid.create({ name, birthdate, owner: req.user.id });
    res.status(201).json(kid);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create kid" });
  }
});

export default router;
