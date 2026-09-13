import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import protectedApi from "../api/protectedApi";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import styles from "./ConfirmedOrders.module.css";
import { IoIosAddCircle, IoIosRemoveCircle } from "react-icons/io";
import { getErrorMessage } from "../lib/getErrorMessage";

interface PendingOrderItem {
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  order_uuid: string;
  product_id: number;
}

export default function PendingOrderItems() {
  const queryClient = useQueryClient();

  const fetchData = async (): Promise<PendingOrderItem[]> => {
    const res = await protectedApi.get("/api/pending-orders/items");

    return res.data.items;
  };

  const { data: items, isLoading, isError, error } = useQuery({
    queryKey: ["pending-order-items"],
    queryFn: fetchData,
  });

  const updateQuantity = useMutation({
    mutationFn: async ({
      productId,
      action,
    }: {
      productId: number;
      action: "increase" | "decrease";
    }) => {
      const res = await protectedApi.patch(
        `/api/pending-orders/items/${productId}`,
        { action },
      );

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-order-items"] });
      queryClient.invalidateQueries({ queryKey: ["pending"] });
    },
  });

  if (isLoading) return <LoadingState label="Loading pending items" fullPage={false} />;

  if (isError || !items) {
    return (
      <ErrorState
        label={getErrorMessage(error, "Unable to load pending items")}
        fullPage={false}
      />
    );
  }

  return (
    <div className={styles.itemsCard}>
      {updateQuantity.isError && (
        <p className={styles.errorText}>
          {getErrorMessage(updateQuantity.error)}
        </p>
      )}

      {items.map((item) => (
        <div
          className={styles.item}
          key={`${item.order_uuid}-${item.name}`}
        >
          <img
            src={item.image_url}
            alt={item.name}
            className={styles.itemImage}
          />

          <div className={styles.itemInfo}>
            <span className={styles.itemName}>{item.name}</span>

            <span className={styles.itemPrice}>
              €{Number(item.price).toFixed(2)}
            </span>

            <span className={styles.itemQuantity}>
              Quantity: {item.quantity}
            </span>

            <div className={styles.pendingQuantityControls}>
              <button
                type="button"
                className={`${styles.quantityButton} ${styles.quantityButtonRemove}`}
                onClick={() =>
                  updateQuantity.mutate({
                    productId: item.product_id,
                    action: "decrease",
                  })
                }
                disabled={updateQuantity.isPending}
                aria-label={`Decrease ${item.name} quantity`}
              >
                <IoIosRemoveCircle size={25} />
              </button>

              <span className={styles.quantityValue}>{item.quantity}</span>

              <button
                type="button"
                className={`${styles.quantityButton} ${styles.quantityButtonAdd}`}
                onClick={() =>
                  updateQuantity.mutate({
                    productId: item.product_id,
                    action: "increase",
                  })
                }
                disabled={updateQuantity.isPending}
                aria-label={`Increase ${item.name} quantity`}
              >
                <IoIosAddCircle size={25} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}