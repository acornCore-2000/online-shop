import ShopByCategory, {type ShopByCategoryType} from "../components/ShopByCategory";
import Footer from "../components/Footer";
import styles from "./Collection.module.css";

const categories: ShopByCategoryType[] = [
    {
        name:"Clothing", 
        gender:"men", 
        season:"summer", 
        imageUrl:"/summer-clothing-men.jpg"
    },  {
        name:"Shoes", 
        gender:"men", 
        season:"summer", 
        imageUrl:"/summer-shoes-men.webp"
    },  {
        name:"Accessories", 
        gender:"men", 
        season:"summer", 
        imageUrl:"/summer-accessories-men.jpg"
    }, 
    
]




export default function SummerCollectionMen() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <ShopByCategory categories={categories} />
      </div>
      <Footer />
    </div>
  )
}