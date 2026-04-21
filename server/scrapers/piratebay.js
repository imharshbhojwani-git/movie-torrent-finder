const axios = require("axios");
const { fetchWithPowerShell } = require("../utils/psfetch");

const APIBAY_MIRRORS = [
  "https://apibay.org",
  "https://apibay.la",
];

async function searchPirateBay(query) {
  // Sanitize query for PowerShell safety
  const safeQuery = query.replace(/['"`;]/g, "");

  for (const base of APIBAY_MIRRORS) {
    const url = `${base}/q.php?q=${encodeURIComponent(safeQuery)}&cat=200`;

    // Try axios first
    let raw = null;
    try {
      const res = await axios.get(url, {
        timeout: 12000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" },
      });
      raw = res.data;
    } catch (axiosErr) {
      console.log(`axios failed for ${base}, trying PowerShell...`);
      try {
        const text = await fetchWithPowerShell(url);
        raw = JSON.parse(text);
      } catch (psErr) {
        console.error(`PowerShell also failed for ${base}:`, psErr.message);
        continue;
      }
    }

    if (!Array.isArray(raw) || raw[0]?.name === "No results returned") continue;

    const torrents = raw
      .filter((t) => parseInt(t.seeders) > 0)
      .slice(0, 20)
      .map((t) => ({
        quality: detectQuality(t.name),
        type: "web",
        size: formatSize(parseInt(t.size)),
        seeds: parseInt(t.seeders),
        peers: parseInt(t.leechers),
        magnet: buildMagnet(t.info_hash, t.name),
        name: t.name,
      }));

    if (torrents.length === 0) continue;

    return [{
      source: "PirateBay",
      title: query,
      year: null,
      rating: null,
      poster: null,
      summary: null,
      genres: [],
      torrents,
    }];
  }
  return [];
}

function buildMagnet(hash, name) {
  const trackers = [
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://open.tracker.cl:1337/announce",
    "udp://9.rarbg.com:2810/announce",
    "udp://tracker.openbittorrent.com:6969/announce",
    "udp://exodus.desync.com:6969/announce",
  ];
  const tr = trackers.map((t) => `&tr=${encodeURIComponent(t)}`).join("");
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(name)}${tr}`;
}

function detectQuality(name) {
  const n = name.toLowerCase();
  if (n.includes("2160p") || n.includes("4k") || n.includes("uhd")) return "2160p";
  if (n.includes("1080p")) return "1080p";
  if (n.includes("720p")) return "720p";
  if (n.includes("480p")) return "480p";
  return "Unknown";
}

function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return "Unknown";
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 ** 2);
  return `${mb.toFixed(0)} MB`;
}

module.exports = { searchPirateBay };
