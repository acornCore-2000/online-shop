import styles from "./SeasonCard.module.css";
import { Link } from "react-router-dom";

export interface SeasonCategory {
  
  title: string;
  gender: string;
  imageUrl: string;
}

interface SeasonCardProps {
  seasons: SeasonCategory[];
}

export default function SeasonCard({ seasons }: SeasonCardProps) {
  return (
    <div className={styles.card}>
      {seasons.map((season) => (
        <Link key={season.title} to={`/${(season.gender)}/${(season.title).split(" ")[0]}`} className={styles.seasonCategory}>
          <img
            src={season.imageUrl}
            alt={season.title}
            className={styles.image}
          />

          <h3>{season.title}</h3>
        </Link>
      ))}
    </div>
  );
}
