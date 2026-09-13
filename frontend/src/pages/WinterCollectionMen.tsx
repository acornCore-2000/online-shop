import ShopByCategory, {type ShopByCategoryType} from "../components/ShopByCategory";
import Footer from "../components/Footer";
import styles from "./Collection.module.css";

const categories: ShopByCategoryType[] = [
    {
        name:"Clothing", 
        gender:"men", 
        season:"winter", 
        imageUrl:"/winter-clothing-men.webp"
    },  {
        name:"Shoes", 
        gender:"men", 
        season:"winter", 
        imageUrl:"/winter-shoes-men.webp"
    },  {
        name:"Accessories", 
        gender:"men", 
        season:"winter", 
        imageUrl:"/winter-accessories-men.jpg"
    }, 
    
]




export default function WinterCollectionMen() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <ShopByCategory categories={categories} />
      </div>
      <Footer />
    </div>
  )
}