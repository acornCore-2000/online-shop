import { FaInstagram } from "react-icons/fa";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__content}>
        <p className={styles.footer__copyright}>
          © 2026 Shopify. All rights reserved.
        </p>

        <a
          href="https://instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footer__instagram}
        >
          <FaInstagram size={22} />
          <span>Instagram</span>
        </a>
      </div>
    </footer>
  );
}