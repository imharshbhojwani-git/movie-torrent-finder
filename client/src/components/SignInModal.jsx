import { GoogleLogin } from "@react-oauth/google";
import styles from "./SignInModal.module.css";

export default function SignInModal({ onSuccess, onDenied }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon}>🎬</div>
        <h2 className={styles.title}>Welcome to Movie Torrent Finder</h2>
        <p className={styles.subtitle}>Sign in with Google to access the search</p>

        <div className={styles.googleBtn}>
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => onDenied("Sign in failed. Please try again.")}
            useOneTap={false}
            theme="filled_black"
            shape="pill"
            size="large"
            text="signin_with"
          />
        </div>

        <p className={styles.note}>Access is restricted to approved users only.</p>
      </div>
    </div>
  );
}
