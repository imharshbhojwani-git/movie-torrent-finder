const { searchYTS } = require("./yts");
const { search1337x } = require("./1337x");
const { searchPirateBay } = require("./piratebay");
const { getMovieMetadata } = require("./metadata");

async function searchAll(query) {
  const [ytsResult, leetResult, pbResult] = await Promise.allSettled([
    searchYTS(query),
    search1337x(query),
    searchPirateBay(query),
  ]);

  const yts = ytsResult.status === "fulfilled" ? ytsResult.value : [];
  const leet = leetResult.status === "fulfilled" ? leetResult.value : [];
  const pb = pbResult.status === "fulfilled" ? pbResult.value : [];

  let results = [];

  if (yts.length > 0) {
    const ytsQualities = new Set(yts.flatMap((r) => r.torrents.map((t) => t.quality)));
    const extraFromPB = pb.flatMap((r) => r.torrents).filter((t) => !ytsQualities.has(t.quality));
    const extraFromLeet = leet.flatMap((r) => r.torrents).filter((t) => !ytsQualities.has(t.quality));
    if (yts[0] && (extraFromPB.length > 0 || extraFromLeet.length > 0)) {
      yts[0].torrents.push(...extraFromPB, ...extraFromLeet);
    }
    results = yts;
  } else if (pb.length > 0) {
    results = pb;
  } else {
    results = leet;
  }

  // Enrich results that have no poster/summary with Wikipedia metadata
  await Promise.all(
    results.map(async (movie) => {
      if (!movie.poster || !movie.summary) {
        const meta = await getMovieMetadata(movie.title, movie.year);
        if (meta) {
          if (!movie.poster) movie.poster = meta.poster;
          if (!movie.summary) movie.summary = meta.summary;
          if (!movie.title || movie.title === query) movie.title = meta.title;
        }
      }
    })
  );

  return results;
}

module.exports = { searchAll };
