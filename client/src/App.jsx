import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";
import SignInModal from "./components/SignInModal";
import AdminDashboard from "./components/AdminDashboard";
import styles from "./App.module.css";

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("mtf_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("mtf_token") || null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [deniedMsg, setDeniedMsg] = useState(null);
  const [pendingSearch, setPendingSearch] = useState(null);

  useEffect(() => {
    if (pendingSearch && user) {
      handleSearch(pendingSearch);
      setPendingSearch(null);
    }
  }, [user]);

  async function handleGoogleSuccess(credentialResponse) {
    const idToken = credentialResponse.credential;
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await res.json();

      if (res.status === 403) {
        setShowSignIn(false);
        setDeniedMsg("Sorry, not allowed. Grow your karma with the master. 🙏");
        return;
      }

      const userData = { email: data.email, name: data.name, picture: data.picture, isMaster: data.isMaster };
      setUser(userData);
      setToken(idToken);
      localStorage.setItem("mtf_user", JSON.stringify(userData));
      localStorage.setItem("mtf_token", idToken);
      setShowSignIn(false);
      setDeniedMsg(null);
    } catch {
      setDeniedMsg("Something went wrong. Please try again.");
    }
  }

  function handleSignOut() {
    setUser(null);
    setToken(null);
    setResults([]);
    setSearched(false);
    localStorage.removeItem("mtf_user");
    localStorage.removeItem("mtf_token");
  }

  async function handleSearch(query) {
    if (!user) {
      setPendingSearch(query);
      setShowSignIn(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        handleSignOut();
        setShowSignIn(true);
        return;
      }

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
      {showSignIn && (
        <SignInModal
          onSuccess={handleGoogleSuccess}
          onDenied={setDeniedMsg}
        />
      )}

      {showAdmin && user?.isMaster && (
        <AdminDashboard token={token} onClose={() => setShowAdmin(false)} />
      )}

      <header className={styles.header}>
        <div className={styles.topBar}>
          {user ? (
            <div className={styles.userInfo}>
              {user.picture && <img src={user.picture} className={styles.avatar} alt="" />}
              <span className={styles.userName}>{user.name}</span>
              {user.isMaster && (
                <button className={styles.adminBtn} onClick={() => setShowAdmin(true)}>
                  👑 Dashboard
                </button>
              )}
              <button className={styles.signOutBtn} onClick={handleSignOut}>Sign out</button>
            </div>
          ) : (
            <button className={styles.signInBtn} onClick={() => setShowSignIn(true)}>
              Sign in
            </button>
          )}
        </div>

        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎬</span>
          <h1>Movie Torrent Finder</h1>
        </div>
        <p className={styles.subtitle}>Search any movie — get direct download links</p>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </header>

      <main className={styles.main}>
        {deniedMsg && <div className={styles.denied}>{deniedMsg}</div>}

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
