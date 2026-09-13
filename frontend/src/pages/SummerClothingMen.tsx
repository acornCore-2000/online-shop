import ProductCard, { type ProductCardType } from "../components/ProductCard";
import styles from "./ProductPage.module.css";
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const fetchProducts = async (): Promise<ProductCardType[]> => {
  const response = await api.get("/api/products", {
    params: {
      gender: "men",
      season: "summer",
      category: "clothing",
    },
  });

  return response.data.products;
};

export default function SummerClothingMen() {
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products", "men", "summer", "clothing"],
    queryFn: fetchProducts,
  });

  if (isLoading) {
    return <LoadingState label="Loading products" />;
  }

  if (isError) {
    return <ErrorState label="Unable to load products" />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.uuid} product={product} />
        ))}
      </div>
    </div>
  );
}