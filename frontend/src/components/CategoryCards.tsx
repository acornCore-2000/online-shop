import styles from './CategoryCards.module.css';
import { Link } from 'react-router-dom';

export interface Category {
  id: number
  name: string
  itemCount: number
  imageUrl: string
}

interface CategoryCardsProps {
  categories: Category[]
}

const CategoryCards = ({ categories }: CategoryCardsProps) => {
  return (
    <div className={styles.categoryGrid}>
      {categories.map((category, index) => (
    <Link
      key={category.name}
      to={`/${category.name}`}
      className={styles.categoryCard}
    >
      <div className={styles.categoryCardImageWrap}>
        <img
          src={category.imageUrl}
          alt={category.name}
          className={styles.categoryCardImage}
          loading="lazy"
        />
        <span className={styles.categoryCardCount}>
          {category.itemCount} items
        </span>
      </div>

      <div className={styles.categoryCardBody}>
        <span className={styles.categoryCardIndex}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </Link>
))}
    </div>
  )
}

export default CategoryCards

