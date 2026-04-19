import TorrentList from "./TorrentList";
import styles from "./MovieCard.module.css";

export default function MovieCard({ movie }) {
  const hasMetadata = movie.title && movie.year;

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        {movie.poster && (
          <img
            className={styles.poster}
            src={movie.poster}
            alt={movie.title}
            onError={(e) => (e.target.style.display = "none")}
          />
        )}
        <div className={styles.info}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{movie.title}</h2>
            {movie.year && <span className={styles.year}>{movie.year}</span>}
            {movie.rating && (
              <span className={styles.rating}>⭐ {movie.rating}</span>
            )}
          </div>

          {movie.genres && movie.genres.length > 0 && (
            <div className={styles.genres}>
              {movie.genres.map((g) => (
                <span key={g} className={styles.genre}>
                  {g}
                </span>
              ))}
            </div>
          )}

          {movie.summary && (
            <p className={styles.summary}>
              {movie.summary.length > 300
                ? movie.summary.slice(0, 300) + "..."
                : movie.summary}
            </p>
          )}

          <div className={styles.sourceBadge}>{movie.source}</div>
        </div>
      </div>

      <TorrentList torrents={movie.torrents} />
    </div>
  );
}
