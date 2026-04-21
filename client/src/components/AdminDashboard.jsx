import { useState, useEffect } from "react";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard({ token, onClose }) {
  const [users, setUsers] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data.allowed || []);
  }

  async function addUser() {
    const email = newEmail.trim();
    if (!email) return;
    setLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      setUsers(data.allowed);
      setNewEmail("");
      setMessage({ type: "success", text: `${email} added successfully` });
    } else {
      setMessage({ type: "error", text: data.error });
    }
    setLoading(false);
    setTimeout(() => setMessage(null), 3000);
  }

  async function removeUser(email) {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      setUsers(data.allowed);
      setMessage({ type: "success", text: `${email} removed` });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  function formatDate(iso) {
    if (!iso) return "Never";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>👑 Master Dashboard</h2>
            <p className={styles.sub}>{users.length} user{users.length !== 1 ? "s" : ""} allowed</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.addSection}>
          <input
            className={styles.input}
            type="email"
            placeholder="Enter email to allow access..."
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUser()}
          />
          <button className={styles.addBtn} onClick={addUser} disabled={loading || !newEmail.trim()}>
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>

        <div className={styles.userList}>
          {users.length === 0 && (
            <p className={styles.empty}>No users added yet. Add someone above.</p>
          )}
          {users.map((user) => (
            <div key={user.email} className={styles.userRow}>
              <div className={styles.userInfo}>
                <span className={styles.email}>{user.email}</span>
                <span className={styles.meta}>
                  Added {formatDate(user.addedOn)} · Last seen {formatDate(user.lastSeen)}
                </span>
              </div>
              <button className={styles.removeBtn} onClick={() => removeUser(user.email)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
