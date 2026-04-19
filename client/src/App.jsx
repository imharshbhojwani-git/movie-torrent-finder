import { useState } from "react";
import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";
import styles from "./App.module.css";

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(query) {
    setLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError("Something went wrong. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎬</span>
          <h1>Movie Torrent Finder</h1>
        </div>
        <p className={styles.subtitle}>Search any movie — get direct download links</p>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </header>

      <main className={styles.main}>
        {loading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p>Searching across torrent sources...</p>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {!loading && searched && results.length === 0 && !error && (
          <div className={styles.noResults}>
            <p>No results found. Try a different movie name.</p>
          </div>
        )}

        <div className={styles.results}>
          {results.map((movie, i) => (
            <MovieCard key={i} movie={movie} />
          ))}
        </div>
      </main>
    </div>
  );
}
