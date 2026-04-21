const express = require("express");
const fs = require("fs");
const path = require("path");
const { requireMaster } = require("../middleware/auth");

const router = express.Router();
const USERS_FILE = path.join(__dirname, "../users.json");

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// Get all allowed users
router.get("/users", requireMaster, (req, res) => {
  const users = readUsers();
  res.json({ master: users.master, allowed: users.allowed });
});

// Add a user
router.post("/users", requireMaster, (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const users = readUsers();

  if (email === users.master) {
    return res.status(400).json({ error: "That's the master email" });
  }

  if (users.allowed.some((u) => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }

  users.allowed.push({
    email,
    addedOn: new Date().toISOString(),
    lastSeen: null,
  });

  writeUsers(users);
  res.json({ success: true, allowed: users.allowed });
});

// Remove a user
router.delete("/users/:email", requireMaster, (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const users = readUsers();

  users.allowed = users.allowed.filter((u) => u.email !== email);
  writeUsers(users);

  res.json({ success: true, allowed: users.allowed });
});

module.exports = router;
