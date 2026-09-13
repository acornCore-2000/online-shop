import { useEffect, useState } from "react";
import styles from "./ProductCard.module.css";
import api from "../api/api";
import { IoIosAddCircle, IoIosRemoveCircle } from "react-icons/io";
import { FiInfo, FiX } from "react-icons/fi";
import { getErrorMessage } from "../lib/getErrorMessage";

export interface ProductCardType {
  id: number;
  uuid: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  description?: string | null;
}

interface ProductCardProps {
  product: ProductCardType;
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [productQuantity, setProductQuantity] = useState(0);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    if (!showDescription) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowDescription(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showDescription]);

  useEffect(() => {
    const getCartQuantity = async () => {setProductQuantity(product.quantity);
      try {
        const response = await api.get("/api/fetch-cart");

        const item = response.data.cart.find(
          (item: CartItem) => item.product_id === product.id,
        );

        setQuantity(item?.quantity ?? 0);
        
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "status" in error.response &&
          error.response.status !== 401
        ) {
          console.error("Failed to fetch cart:", error);
        }
      }
    };

    getCartQuantity();
  }, [product.id, product.quantity]);

  const addToCart = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setMessage("");

      if (product.quantity < 1) {
        return window.alert(
          "You've reached the maximum available quantity for this product.",
        );
      }

      const response = await api.post("/api/add-to-cart", {
        product_id: product.id,
      });

      const item = response.data.cart.find(
        (item: CartItem) => item.product_id === product.id,
      );
      setProductQuantity(response.data.productQuantity);
      setQuantity(item?.quantity ?? 0);
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, "Could not add this product to your cart."));
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async () => {
    if (loading || quantity === 0) return;

    try {
      setLoading(true);
      setMessage("");

      const response = await api.patch("/api/remove-from-cart", {
        product_id: product.id,
      });
      setProductQuantity(response.data.productQuantity);
      if (response.data.itemQuantity !== undefined) {
        setQuantity(response.data.itemQuantity);
      } else {
        const item = response.data.cart?.[0];

        setQuantity(item?.quantity ?? 0);
      }
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, "Could not remove this product from your cart."));
    } finally {
      setLoading(false);
    }
  };

return (
  <div className={styles.card} key={product.id}>
    <button
      type="button"
      className={styles.infoButton}
      onClick={() => setShowDescription(true)}
      aria-label={`View information about ${product.name}`}
      title="View product information"
    >
      <FiInfo size={15} />
    </button>

    <img
      src={product.image_url}
      alt={product.name}
      className={styles.image}
    />

    {showDescription && (
      <div
        className={styles.descriptionPopup}
        role="dialog"
        aria-label={`${product.name} information`}
      >
        <div className={styles.descriptionHeader}>
          <h3>{product.name}</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setShowDescription(false)}
            aria-label="Close product information"
            title="Close"
          >
            <FiX size={16} />
          </button>
        </div>
        <p>{product.description?.trim() || "No description available."}</p>
      </div>
    )}

    <div className={styles.footer}>
      <div className={styles.priceSection}>
        {productQuantity !==0 && (<p className={styles.price}>${product.price}</p>)}
        

        {productQuantity === 0 && (
          <span className={styles.unavailable}>
            <span className={styles.statusDot}></span>
            Unavailable
          </span>
        )}
      </div>

      <div className={styles.cartControls}>
        {quantity > 0 && (
          <>
            <button
              className={`${styles.cartBtn} ${styles.cartBtnRemove}`}
              onClick={removeFromCart}
              disabled={loading}
              aria-label="Remove from cart"
            >
              <IoIosRemoveCircle size={30} />
            </button>

            <span>{quantity}</span>
          </>
        )}

        {productQuantity !== 0 && (
          <button
            className={`${styles.cartBtn} ${
              quantity > 0 ? styles.cartBtnAdded : ""
            }`}
            onClick={addToCart}
            disabled={loading}
            aria-label="Add to cart"
          >
            <IoIosAddCircle size={30} />
          </button>
        )}
      </div>
    </div>

    {message && <p className={styles.errorText}>{message}</p>}
  </div>
);
}
