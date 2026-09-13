import ShopByCategory, {type ShopByCategoryType} from "../components/ShopByCategory";
import Footer from "../components/Footer";
import styles from "./Collection.module.css";

const categories: ShopByCategoryType[] = [
    {
        name:"Clothing", 
        gender:"unisex", 
        season:"summer", 
        imageUrl:"/summer-clothing-unisex.avif"
    },  {
        name:"Shoes", 
        gender:"unisex", 
        season:"summer", 
        imageUrl:"/summer-shoes-unisex.avif"
    },  {
        name:"Accessories", 
        gender:"unisex", 
        season:"summer", 
        imageUrl:"/summer-accessories-unisex.jpg"
    }, 
    
]




export default function SummerCollectionUnisex() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <ShopByCategory categories={categories} />
      </div>
      <Footer />
    </div>
  )
}