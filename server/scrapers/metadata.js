const axios = require("axios");

const HEADERS = {
  "User-Agent": "MovieTorrentFinder/1.0 (educational project)",
};

async function getMovieMetadata(title, year) {
  const candidates = year
    ? [`${title} (${year} film)`, `${title} (film)`, title]
    : [`${title} (film)`, title];

  for (const candidate of candidates) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`;
      const res = await axios.get(url, { timeout: 8000, headers: HEADERS });
      const data = res.data;

      if (data.type === "disambiguation" || !data.extract) continue;

      return {
        summary: data.extract,
        poster: data.originalimage?.source || data.thumbnail?.source || null,
        title: data.title?.replace(/ \(\d{4} film\)| \(film\)/, "").trim() || title,
        wikiUrl: data.content_urls?.desktop?.page || null,
      };
    } catch {
      continue;
    }
  }
  return null;
}

module.exports = { getMovieMetadata };
