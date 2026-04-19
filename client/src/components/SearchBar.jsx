import { useState } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const q = value.trim();
    if (q) onSearch(q);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputWrap}>
        <span className={styles.icon}>🔍</span>
        <input
          className={styles.input}
          type="text"
          placeholder="Enter movie name... e.g. Inception, The Dark Knight"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <button className={styles.button} type="submit" disabled={loading || !value.trim()}>
          {loading ? "Searching..." : "Find Torrents"}
        </button>
      </div>
    </form>
  );
}
