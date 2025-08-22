import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // basic validation
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be ≥ 6 chars" });

    // unique email
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    // hash & save
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase().trim(), passwordHash });

    // return a token immediately (so the FE can log in)
    return res.status(201).json({ token: sign(user._id) });
  } catch (e) {
    // handle duplicate key race condition
    if (e.code === 11000) return res.status(409).json({ error: "Email already registered" });
    console.error(e);
    return res.status(500).json({ error: "Register failed" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    return res.json({ token: sign(user._id) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Login failed" });
  }
});


export default router;
