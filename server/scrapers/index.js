const { searchYTS } = require("./yts");
const { search1337x } = require("./1337x");

async function searchAll(query) {
  const [ytsResults, leet] = await Promise.allSettled([
    searchYTS(query),
    search1337x(query),
  ]);

  const results = [];

  if (ytsResults.status === "fulfilled") {
    results.push(...ytsResults.value);
  }

  if (leet.status === "fulfilled" && leet.value.length > 0) {
    // Only add 1337x if YTS had no results
    if (results.length === 0) {
      results.push(...leet.value);
    } else {
      // Merge 1337x torrents for extra quality options not in YTS
      const ytsQualities = new Set(
        results.flatMap((r) => r.torrents.map((t) => t.quality))
      );
      const extraTorrents = leet.value
        .flatMap((r) => r.torrents)
        .filter((t) => !ytsQualities.has(t.quality));

      if (extraTorrents.length > 0 && results[0]) {
        results[0].torrents.push(...extraTorrents);
      }
    }
  }

  return results;
}

module.exports = { searchAll };
