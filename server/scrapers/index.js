const { searchYTS } = require("./yts");
const { search1337x } = require("./1337x");
const { searchPirateBay } = require("./piratebay");

async function searchAll(query) {
  const [ytsResult, leetResult, pbResult] = await Promise.allSettled([
    searchYTS(query),
    search1337x(query),
    searchPirateBay(query),
  ]);

  const yts = ytsResult.status === "fulfilled" ? ytsResult.value : [];
  const leet = leetResult.status === "fulfilled" ? leetResult.value : [];
  const pb = pbResult.status === "fulfilled" ? pbResult.value : [];

  // YTS has best metadata — use it as base if available
  if (yts.length > 0) {
    const ytsQualities = new Set(yts.flatMap((r) => r.torrents.map((t) => t.quality)));
    const extraFromPB = pb.flatMap((r) => r.torrents).filter((t) => !ytsQualities.has(t.quality));
    const extraFromLeet = leet.flatMap((r) => r.torrents).filter((t) => !ytsQualities.has(t.quality));
    if (yts[0] && (extraFromPB.length > 0 || extraFromLeet.length > 0)) {
      yts[0].torrents.push(...extraFromPB, ...extraFromLeet);
    }
    return yts;
  }

  // Fallback to PirateBay
  if (pb.length > 0) return pb;

  // Last resort: 1337x
  return leet;
}

module.exports = { searchAll };
