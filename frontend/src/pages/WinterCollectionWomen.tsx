import ShopByCategory, {type ShopByCategoryType} from "../components/ShopByCategory";
import Footer from "../components/Footer";
import styles from "./Collection.module.css";

const categories: ShopByCategoryType[] = [
    {
        name:"Clothing", 
        gender:"women", 
        season:"winter", 
        imageUrl:"/winter-clothing-women.jpg"
    },  {
        name:"Shoes", 
        gender:"women", 
        season:"winter", 
        imageUrl:"/winter-shoes-women.webp"
    },  {
        name:"Accessories", 
        gender:"women", 
        season:"winter", 
        imageUrl:"/winter-accessories-women.webp"
    }, 
    
]




export default function WinterCollectionWomen() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <ShopByCategory categories={categories} />
      </div>
      <Footer />
    </div>
  )
}