require("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1"]);
const express = require("express");
const cors = require("cors");
const { searchAll } = require("./scrapers");
const { requireAuth } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/search", requireAuth, async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const results = await searchAll(query);
    res.json({ results });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
