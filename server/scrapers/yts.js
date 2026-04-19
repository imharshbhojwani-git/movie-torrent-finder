const axios = require("axios");

const YTS_MIRRORS = [
  "https://yts.mx/api/v2",
  "https://yts.rs/api/v2",
  "https://yts.pm/api/v2",
];

async function searchYTS(query) {
  for (const base of YTS_MIRRORS) {
    try {
      const response = await axios.get(`${base}/list_movies.json`, {
        params: { query_term: query, limit: 10, sort_by: "seeds" },
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        },
      });

      const data = response.data;
      if (data.status !== "ok" || !data.data || !data.data.movies) continue;

      return data.data.movies.map((movie) => ({
        source: "YTS",
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        poster: movie.large_cover_image || movie.medium_cover_image,
        summary: movie.summary,
        genres: movie.genres || [],
        torrents: (movie.torrents || []).map((t) => ({
          quality: t.quality,
          type: t.type,
          size: t.size,
          seeds: t.seeds,
          peers: t.peers,
          magnet: buildMagnet(t.hash, movie.title),
          hash: t.hash,
        })),
      }));
    } catch (err) {
      console.error(`YTS mirror ${base} failed:`, err.message);
    }
  }
  return [];
}

function buildMagnet(hash, title) {
  const trackers = [
    "udp://open.demonii.com:1337/announce",
    "udp://tracker.openbittorrent.com:80",
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://p4p.arenabg.com:1337",
    "udp://tracker.leechers-paradise.org:6969",
  ];
  const trackerStr = trackers.map((t) => `&tr=${encodeURIComponent(t)}`).join("");
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title)}${trackerStr}`;
}

module.exports = { searchYTS };
