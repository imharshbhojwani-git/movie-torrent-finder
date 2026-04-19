const axios = require("axios");

const APIBAY_MIRRORS = [
  "https://apibay.org",
  "https://pirates-of-the-caribbean.eu",
];

async function searchPirateBay(query) {
  for (const base of APIBAY_MIRRORS) {
    try {
      const res = await axios.get(`${base}/q.php`, {
        params: { q: query, cat: 200 },
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        },
      });

      const items = res.data;
      if (!Array.isArray(items) || items[0]?.name === "No results returned") return [];

      const torrents = items
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

      if (torrents.length === 0) return [];

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
    } catch (err) {
      console.error(`apibay mirror ${base} failed:`, err.message);
    }
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
