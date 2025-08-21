import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, iat, exp }
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
