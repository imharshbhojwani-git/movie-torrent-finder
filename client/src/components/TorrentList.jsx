import styles from "./TorrentList.module.css";

const QUALITY_ORDER = ["2160p", "1080p", "720p", "480p", "Unknown"];
const QUALITY_LABELS = {
  "2160p": "4K / 2160p",
  "1080p": "1080p",
  "720p": "720p",
  "480p": "480p",
  Unknown: "Other",
};
const QUALITY_COLORS = {
  "2160p": "#9b59b6",
  "1080p": "#e50914",
  "720p": "#2980b9",
  "480p": "#27ae60",
  Unknown: "#555",
};

export default function TorrentList({ torrents }) {
  if (!torrents || torrents.length === 0) return null;

  const grouped = {};
  for (const t of torrents) {
    const q = t.quality || "Unknown";
    if (!grouped[q]) grouped[q] = [];
    grouped[q].push(t);
  }

  // Sort each group by seeds descending
  for (const q in grouped) {
    grouped[q].sort((a, b) => (b.seeds || 0) - (a.seeds || 0));
  }

  const orderedKeys = QUALITY_ORDER.filter((q) => grouped[q]);

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Available Downloads</h3>
      <div className={styles.table}>
        <div className={styles.tableHead}>
          <span>Quality</span>
          <span>Size</span>
          <span>Seeds</span>
          <span>Peers</span>
          <span>Download</span>
        </div>
        {orderedKeys.map((quality) =>
          grouped[quality].map((torrent, i) => (
            <div key={`${quality}-${i}`} className={styles.row}>
              <span>
                <span
                  className={styles.qualityBadge}
                  style={{ background: QUALITY_COLORS[quality] || "#555" }}
                >
                  {QUALITY_LABELS[quality] || quality}
                </span>
                {torrent.type && torrent.type !== "web" && (
                  <span className={styles.type}>{torrent.type}</span>
                )}
              </span>
              <span className={styles.size}>{torrent.size || "—"}</span>
              <span className={styles.seeds}>
                {torrent.seeds != null ? (
                  <span className={styles.seedsCount}>▲ {torrent.seeds}</span>
                ) : "—"}
              </span>
              <span className={styles.peers}>
                {torrent.peers != null ? `▼ ${torrent.peers}` : "—"}
              </span>
              <span className={styles.actions}>
                {torrent.magnet && (
                  <a
                    className={styles.magnetBtn}
                    href={torrent.magnet}
                    title="Open in torrent client"
                  >
                    🧲 Magnet
                  </a>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
