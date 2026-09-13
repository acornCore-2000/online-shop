import { useNavigate } from "react-router-dom";
import styles from "./LoginPrompt.module.css";

interface LoginPromptProps {
  title: string;
  message: string;
}

export default function LoginPrompt({ title, message }: LoginPromptProps) {
  const navigate = useNavigate();

  return (
    <section className={styles.loginPrompt}>
      <h2>{title}</h2>
      <p>{message}</p>
      <button
        type="button"
        className={styles.loginButton}
        onClick={() => navigate("/login")}
      >
        Log in
      </button>
    </section>
  );
}
