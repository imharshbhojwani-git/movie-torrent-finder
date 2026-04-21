const express = require("express");
const fs = require("fs");
const path = require("path");
const { verifyToken, readUsers } = require("../middleware/auth");

const router = express.Router();
const USERS_FILE = path.join(__dirname, "../users.json");

router.post("/verify", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token required" });

  try {
    const payload = await verifyToken(token);
    const email = payload.email;
    const users = readUsers();

    const isMaster = email === users.master;
    const isAllowed = isMaster || users.allowed.some((u) => u.email === email);

    if (!isAllowed) {
      return res.status(403).json({ error: "not_allowed" });
    }

    // Update lastSeen for allowed users
    if (!isMaster) {
      const user = users.allowed.find((u) => u.email === email);
      if (user) {
        user.lastSeen = new Date().toISOString();
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      }
    }

    res.json({
      allowed: true,
      isMaster,
      email,
      name: payload.name,
      picture: payload.picture,
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
