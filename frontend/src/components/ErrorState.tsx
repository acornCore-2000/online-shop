import styles from "./ErrorState.module.css";

type ErrorStateProps = {
  label?: string;
  fullPage?: boolean;
};

export default function ErrorState({
  label = "Something went wrong",
  fullPage = true,
}: ErrorStateProps) {
  return (
    <div
      className={`${styles.errorState} ${fullPage ? styles.fullPage : ""}`}
      role="alert"
    >
      <span className={styles.icon} aria-hidden="true">
        !
      </span>
      <p>{label}</p>
    </div>
  );
}
