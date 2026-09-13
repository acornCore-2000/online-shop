import styles from "./LoadingState.module.css";

type LoadingStateProps = {
  label?: string;
  fullPage?: boolean;
};

export default function LoadingState({
  label = "Loading your experience",
  fullPage = true,
}: LoadingStateProps) {
  return (
    <div
      className={`${styles.loadingState} ${fullPage ? styles.fullPage : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.mark} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>{label}</p>
    </div>
  );
}
