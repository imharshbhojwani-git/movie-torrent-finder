const { OAuth2Client } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const USERS_FILE = path.join(__dirname, "../users.json");

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = await verifyToken(token);
    const email = payload.email;
    const users = readUsers();

    const isMaster = email === users.master;
    const isAllowed = isMaster || users.allowed.some((u) => u.email === email);

    if (!isAllowed) {
      return res.status(403).json({ error: "not_allowed" });
    }

    req.user = { email, isMaster, name: payload.name, picture: payload.picture };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

async function requireMaster(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = await verifyToken(token);
    const users = readUsers();

    if (payload.email !== users.master) {
      return res.status(403).json({ error: "Master access required" });
    }

    req.user = { email: payload.email, isMaster: true };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { requireAuth, requireMaster, verifyToken, readUsers };
