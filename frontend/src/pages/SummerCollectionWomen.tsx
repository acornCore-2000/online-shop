import ShopByCategory, {type ShopByCategoryType} from "../components/ShopByCategory";
import Footer from "../components/Footer";
import styles from "./Collection.module.css";

const categories: ShopByCategoryType[] = [
    {
        name:"Clothing", 
        gender:"women", 
        season:"summer", 
        imageUrl:"/summer-clothing-women.webp"
    },  {
        name:"Shoes", 
        gender:"women", 
        season:"summer", 
        imageUrl:"/summer-shoes-women.webp"
    },  {
        name:"Accessories", 
        gender:"women", 
        season:"summer", 
        imageUrl:"/summer-accessories-women.jpg"
    }, 
    
]




export default function SummerCollectionWomen() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <ShopByCategory categories={categories} />
      </div>
      <Footer />
    </div>
  )
}