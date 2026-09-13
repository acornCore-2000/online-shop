import styles from "./ShopByCategory.module.css";
import { Link } from "react-router-dom";

export interface ShopByCategoryType {
  name: string;
  gender: string;
  season: string;
  imageUrl: string;

}

interface ShopByCategoryProps {
  categories: ShopByCategoryType[];
}

export default function ShopByCategory({ categories }: ShopByCategoryProps) {
  return (
    <div className={styles.grid}>
      {categories.map((category) => (
        <Link
          key={category.name}
          to={`/${category.gender}/${category.season}/${category.name}`}
          className={styles.card}
        >
          <img
            src={category.imageUrl}
            alt={category.name}
            className={styles.image}
          />
          <h3 className={styles.name}>{category.name}</h3>
        </Link>
      ))}
    </div>
  );
}


