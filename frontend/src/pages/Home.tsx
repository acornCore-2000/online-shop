import CategoryCards, { type Category } from "../components/CategoryCards";
import Footer from "../components/Footer";

const categories: Category[] = [
  {
    id: 1,
    name: "women",
    itemCount: 5,
    imageUrl: "/women.webp",
  },
  {
    id: 2,
    name: "men",
    itemCount: 5,
    imageUrl: "/men.webp",
  },
  {
    id: 3, 
    name : "unisex", 
    itemCount: 6, 
    imageUrl : "/unisex.webp"
  }
];

function Home() {
  return (
    <>
      <CategoryCards categories={categories} />
      <Footer />
    </>
  );
}

export default Home;
