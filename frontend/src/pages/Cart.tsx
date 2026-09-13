import protectedApi from "../api/protectedApi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { MdOutlineShoppingCartCheckout } from "react-icons/md";
import styles from "./Cart.module.css";
import LoginPrompt from "../components/LoginPrompt";
import LoadingState from "../components/LoadingState";
import { getErrorMessage } from "../lib/getErrorMessage";

interface CartItemType {
  id: number;
  product_id: number;
  quantity: number;
  user_id: number;
  name: string;
  price: number;
  image_url: string;
}

export default function Cart() {
  const { isAuthenticated, isLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartError, setCartError] = useState("");

  const navigate= useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCart = async (): Promise<void> => {
      try {
        const result = await protectedApi.get("/api/fetch-cart");

        if (result.data.empty) {
          setIsEmpty(true);
          setCartItems([]);
        } else {
          setIsEmpty(false);
          setCartItems(result.data.cart);
          
        }
      } catch (error) {
        setCartError(getErrorMessage(error, "Failed to load your cart."));
      }
    };

    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: number) => {
    if (loading) return;

    try {
      setLoading(true);
      setCartError("");

      const response = await protectedApi.post("/api/add-to-cart", {
        product_id: productId,
      });

      const updatedItem = response.data.cart[0];

      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: updatedItem.quantity }
            : item,
        ),
      );
    } catch (error: unknown) {
      setCartError(getErrorMessage(error, "Could not add this product to your cart."));
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (loading) return;

    try {
      setLoading(true);
      setCartError("");

      const response = await protectedApi.patch("/api/remove-from-cart", {
        product_id: productId,
      });
      const isEmpty = response.data.isEmpty;
      const updatedItem = response.data.itemQuantity;
      if (updatedItem === 0) {
        setCartItems((prev) =>
          prev.filter((item) => item.product_id !== productId),
        );
       
        if (isEmpty){
          setIsEmpty(true);
        }
        
      } 
    
       else {
        setCartItems((prev) =>
          prev.map((item) =>
            item.product_id === productId
              ? { ...item, quantity: response.data.cart[0].quantity }
              : item,
          ),
        );
      }
    } catch (error: unknown) {
      setCartError(getErrorMessage(error, "Could not remove this product from your cart."));
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  if (isLoading) {
    return <LoadingState label="Loading your cart" />;
  }


  const handleCheckout= async()=>{
    try{
      setCartError("");
      await protectedApi.post("/api/place-order");
      navigate("/checkout")
    }
    catch(error){
      setCartError(getErrorMessage(error, "Could not start checkout."));
    }
  }

  return (
    <main className={styles.cartPage}>
      {!isAuthenticated ? (
        <div className={styles.cartGuestState}>
          <LoginPrompt
            title="Log in to view your cart"
            message="Please log in to access your shopping cart."
          />
        </div>
      ) : isEmpty ? (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>Your cart is empty.</p>
          {cartError && <p className={styles.errorText}>{cartError}</p>}
        </div>
      ) : (
        <div className={styles.cartContainer}>
          {cartError && <p className={styles.errorText}>{cartError}</p>}

          <div className={styles.cartItems}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <img
                  src={item.image_url}
                  alt={item.name}
                  className={styles.productImage}
                />

                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{item.name}</h3>

                  <div className={styles.quantityControl}>
                    <button
                      className={`${styles.quantityButton} ${styles.quantityButtonRemove}`}
                      onClick={() => removeFromCart(item.product_id)}
                      disabled={loading}
                    >
                      -
                    </button>

                    <p className={styles.quantity}>{item.quantity}</p>

                    <button
                      className={`${styles.quantityButton} ${styles.quantityButtonAdd}`}
                      onClick={() => addToCart(item.product_id)}
                      disabled={loading}
                    >
                      +
                    </button>
                  </div>

                  <p className={styles.price}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.checkoutBox}>
            <div className={styles.totalPrice}>
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            
            <button className={styles.checkoutBtn} type="button" onClick={handleCheckout}>
              Checkout
              <MdOutlineShoppingCartCheckout size={30} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
