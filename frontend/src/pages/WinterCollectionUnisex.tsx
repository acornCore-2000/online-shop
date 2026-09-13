import ShopByCategory, {type ShopByCategoryType} from "../components/ShopByCategory";
import Footer from "../components/Footer";
import styles from "./Collection.module.css";

const categories: ShopByCategoryType[] = [
    {
        name:"Clothing", 
        gender:"unisex", 
        season:"winter", 
        imageUrl:"/winter-clothing-unisex.avif"
    },  {
        name:"Shoes", 
        gender:"unisex", 
        season:"winter", 
        imageUrl:"/winter-shoes-unisex.webp"
    },  {
        name:"Accessories", 
        gender:"unisex", 
        season:"winter", 
        imageUrl:"/winter-accessories-unisex.jpg"
    }, 
    
]




export default function WinterCollectionUnisex() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <ShopByCategory categories={categories} />
      </div>
      <Footer />
    </div>
  )
}