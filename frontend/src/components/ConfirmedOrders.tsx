import protectedApi from "../api/protectedApi";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import { useQuery } from "@tanstack/react-query";
import styles from "./ConfirmedOrders.module.css";
import { getErrorMessage } from "../lib/getErrorMessage";

interface ConfirmedOrderType {
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  order_uuid: string;
  product_id: number;
}

export interface ConfirmedOrderUuidType {
  order_uuid: string;
}

export default function ConfirmedOrderItems(
  props: ConfirmedOrderUuidType
) {
  const fetchData = async (): Promise<ConfirmedOrderType[]> => {
    const res = await protectedApi.get(
      `/api/confirmed-orders/${props.order_uuid}/items`
    );

    return res.data.items;
  };

  const { data: items, isLoading, isError, error } = useQuery({
    queryKey: ["items"],
    queryFn: fetchData,
  });

  if (isLoading) return <LoadingState label="Loading confirmed orders" fullPage={false} />;

  if (isError || !items) {
    return (
      <ErrorState
        label={getErrorMessage(error, "Unable to load confirmed orders")}
        fullPage={false}
      />
    );
  }

  return (
<div className={styles.itemsCard}>
  {items
    .filter((item) => item.order_uuid === props.order_uuid)
    .map((item, index) => (
      <div
        className={styles.item}
        key={`${item.order_uuid}-${item.product_id}-${index}`}
      >
        <img
          src={item.image_url}
          alt={item.name}
          className={styles.itemImage}
        />

        <div className={styles.itemInfo}>
          <span className={styles.itemName}>
            {item.name}
          </span>

          <span className={styles.itemPrice}>
            €{Number(item.price).toFixed(2)}
          </span>

          <span className={styles.itemQuantity}>
            Quantity: {item.quantity}
          </span>
        </div>
      </div>
    ))}
</div>
  );
}