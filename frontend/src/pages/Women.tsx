import type { SeasonCategory } from "../components/SeasonCard";
import SeasonCard from "../components/SeasonCard";
import Footer from "../components/Footer";
import styles from "./Collection.module.css";


const seasons: SeasonCategory[] = [
  {
    title: "Winter Collection",
    imageUrl: "/wintercollection-women.avif",
    gender: "women"
  },
  {
    title: "Summer Collection",
    imageUrl: "/summercollection-women.avif",
    gender: "women"
  },
];

export default function Men() {
  return (
    <div className={styles.collections}>
      <SeasonCard seasons={seasons} />
      <Footer />
    </div>
  );
}
