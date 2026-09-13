import styles from "./ProductCategory.module.css";
import { Link } from "react-router-dom";

export interface ProductCategoryType {
  name: string;
  imageUrl: string;
}

interface ProductCategoryProps {
  categories: ProductCategoryType[];
}

export default function ProductCategory({ categories }: ProductCategoryProps) {
  return (
    <div className={styles.grid}>
      {categories.map((category) => (
        <Link
          key={category.name}
          to={`/category/${category.name.toLowerCase()}`}
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
