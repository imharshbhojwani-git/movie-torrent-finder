const axios = require("axios");

const YTS_API = "https://yts.mx/api/v2";

async function searchYTS(query) {
  try {
    const response = await axios.get(`${YTS_API}/list_movies.json`, {
      params: {
        query_term: query,
        limit: 10,
        sort_by: "seeds",
      },
      timeout: 8000,
    });

    const data = response.data;
    if (data.status !== "ok" || !data.data.movies) return [];

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
    console.error("YTS error:", err.message);
    return [];
  }
}

function buildMagnet(hash, title) {
  const trackers = [
    "udp://open.demonii.com:1337/announce",
    "udp://tracker.openbittorrent.com:80",
    "udp://tracker.coppersurfer.tk:6969",
    "udp://glotorrents.pw:6969/announce",
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://torrent.gresille.org:80/announce",
    "udp://p4p.arenabg.com:1337",
    "udp://tracker.leechers-paradise.org:6969",
  ];
  const trackerStr = trackers.map((t) => `&tr=${encodeURIComponent(t)}`).join("");
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title)}${trackerStr}`;
}

module.exports = { searchYTS };
