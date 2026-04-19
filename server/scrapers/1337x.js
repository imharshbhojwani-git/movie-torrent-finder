const axios = require("axios");
const cheerio = require("cheerio");

const BASE = "https://1337x.to";

async function search1337x(query) {
  try {
    const url = `${BASE}/search/${encodeURIComponent(query)}/1/`;
    const res = await axios.get(url, {
      timeout: 8000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
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

      const quality = detectQuality(name);

      results.push({
        name,
        link: `${BASE}${link}`,
        seeds,
        leeches,
        size,
        quality,
      });
    });

    if (results.length === 0) return [];

    // Fetch magnet links for top 8 results
    const top = results.slice(0, 8);
    const withMagnets = await Promise.all(
      top.map(async (item) => {
        const magnet = await getMagnet(item.link);
        return { ...item, magnet };
      })
    );

    return groupAs1337xResult(query, withMagnets.filter((r) => r.magnet));
  } catch (err) {
    console.error("1337x error:", err.message);
    return [];
  }
}

async function getMagnet(url) {
  try {
    const res = await axios.get(url, {
      timeout: 6000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
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
  if (items.length === 0) return [];
  return [
    {
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
    },
  ];
}

module.exports = { search1337x };
