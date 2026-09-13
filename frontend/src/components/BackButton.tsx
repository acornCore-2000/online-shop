import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styles from "./BackButton.module.css";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={styles.backButton}
      onClick={() => navigate(-1)}
      aria-label="Go back"
      title="Go back"
    >
      <FiArrowLeft aria-hidden="true" />
    </button>
  );
}
