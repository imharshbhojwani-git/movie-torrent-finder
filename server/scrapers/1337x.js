const axios = require("axios");
const cheerio = require("cheerio");

const MIRRORS = [
  "https://1337x.to",
  "https://1337x.st",
  "https://1337x.is",
  "https://x1337x.ws",
  "https://1337x.gd",
];

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Cache-Control": "max-age=0",
};

async function search1337x(query) {
  for (const base of MIRRORS) {
    try {
      const url = `${base}/search/${encodeURIComponent(query)}/1/`;
      const res = await axios.get(url, {
        timeout: 15000,
        headers: { ...HEADERS, "Referer": base },
      });

      const $ = cheerio.load(res.data);
      const results = [];

      $("table.table-list tbody tr").each((i, row) => {
        if (i >= 15) return false;
        const nameEl = $(row).find("td.name a").last();
        const name = nameEl.text().trim();
        const link = nameEl.attr("href");
        const seeds = parseInt($(row).find("td.seeds").text().trim()) || 0;
        const leeches = parseInt($(row).find("td.leeches").text().trim()) || 0;
        const size = $(row).find("td.size").text().replace(/\d+$/, "").trim();
        if (!name || !link) return;
        results.push({ name, link: `${base}${link}`, seeds, leeches, size, quality: detectQuality(name) });
      });

      if (results.length === 0) continue;

      const top = results.slice(0, 8);
      const withMagnets = await Promise.all(top.map(async (item) => {
        const magnet = await getMagnet(item.link);
        return { ...item, magnet };
      }));

      const valid = withMagnets.filter((r) => r.magnet);
      if (valid.length === 0) continue;

      return groupAs1337xResult(query, valid);
    } catch (err) {
      console.error(`1337x mirror ${base} failed:`, err.message);
    }
  }
  return [];
}

async function getMagnet(url) {
  try {
    const res = await axios.get(url, {
      timeout: 12000,
      headers: HEADERS,
    });
    const $ = cheerio.load(res.data);
    return $('a[href^="magnet:"]').attr("href") || null;
  } catch {
    return null;
  }
}

function detectQuality(name) {
  const n = name.toLowerCase();
  if (n.includes("2160p") || n.includes("4k") || n.includes("uhd")) return "2160p";
  if (n.includes("1080p")) return "1080p";
  if (n.includes("720p")) return "720p";
  if (n.includes("480p")) return "480p";
  return "Unknown";
}

function groupAs1337xResult(query, items) {
  return [{
    source: "1337x",
    title: query,
    year: null,
    rating: null,
    poster: null,
    summary: null,
    genres: [],
    torrents: items.map((item) => ({
      quality: item.quality,
      type: "web",
      size: item.size,
      seeds: item.seeds,
      peers: item.leeches,
      magnet: item.magnet,
      name: item.name,
    })),
  }];
}

module.exports = { search1337x };
