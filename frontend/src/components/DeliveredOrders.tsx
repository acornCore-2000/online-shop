import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import protectedApi from "../api/protectedApi";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import styles from "./DeliveredOrders.module.css";
import { getErrorMessage } from "../lib/getErrorMessage";

interface DeliveredOrderItem {
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  order_uuid: string;
  product_id: number;
  return_status: string | null;
}

interface DeliveredOrderItemsProps {
  order_uuid: string;
  returnMode?: boolean;
}

export default function DeliveredOrderItems({
  order_uuid,
  returnMode = false,
}: DeliveredOrderItemsProps) {
  const queryClient = useQueryClient();
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { data: items, isLoading, isError, error } = useQuery({
    queryKey: ["delivered-items", order_uuid],
    queryFn: async (): Promise<DeliveredOrderItem[]> => {
      const res = await protectedApi.get(
        `/api/delivered-orders/${order_uuid}/items`,
      );

      return res.data.items;
    },
  });

  const requestReturn = useMutation({
    mutationFn: async () => {
      const res = await protectedApi.post("/api/returns", {
        orderUuid: order_uuid,
        productIds: selectedProductIds,
        reason,
      });

      return res.data;
    },
    onSuccess: () => {
      setSelectedProductIds([]);
      setReason("");
      setReasonError("");
      setIsConfirmed(false);
      queryClient.invalidateQueries({
        queryKey: ["delivered-items", order_uuid],
      });
    },
  });

  if (isLoading) return <LoadingState label="Loading delivered orders" fullPage={false} />;

  if (isError || !items) {
    return (
      <ErrorState
        label={getErrorMessage(error, "Unable to load delivered orders")}
        fullPage={false}
      />
    );
  }

  return (
    <div className={styles.itemsCard}>
      {returnMode && (
        <p className={styles.returnInstruction}>
          Select the item you want to return.
        </p>
      )}

      {items.map((item, index) => (
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
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemPrice}>
              €{Number(item.price).toFixed(2)}
            </span>
            <span className={styles.itemQuantity}>
              Quantity: {item.quantity}
            </span>

            {item.return_status === "accepted" && (
              <span className={styles.returnAccepted}>Returned</span>
            )}

            {item.return_status === "return_requested" && (
              <span className={styles.returnPending}>
                Return requested
              </span>
            )}
          </div>

          {returnMode && !item.return_status && (
            <label className={styles.itemSelector}>
              <input
                type="checkbox"
                name={`return-item-${order_uuid}`}
                checked={selectedProductIds.includes(item.product_id)}
                onChange={() =>
                  setSelectedProductIds((currentIds) =>
                    currentIds.includes(item.product_id)
                      ? currentIds.filter((id) => id !== item.product_id)
                      : [...currentIds, item.product_id],
                  )
                }
              />
              <span>Select</span>
            </label>
          )}
        </div>
      ))}

      {returnMode && selectedProductIds.length > 0 && (
        <div className={styles.returnForm}>
          <label className={styles.reasonLabel} htmlFor={`return-reason-${order_uuid}`}>
            Reason for return
          </label>
          <textarea
            id={`return-reason-${order_uuid}`}
            value={reason}
            className={`${styles.reasonInput} ${reasonError ? styles.reasonInputError : ""}`}
            onChange={(event) => {
              setReason(event.target.value);
              if (event.target.value.trim()) setReasonError("");
            }}
            placeholder="Tell us why you want to return this item."
            rows={3}
            required
          />

          {reasonError && <p className={styles.returnError}>{reasonError}</p>}

          {!isConfirmed ? (
            <button
              type="button"
              className={styles.returnButton}
              onClick={() => {
                if (!reason.trim()) {
                  setReasonError("This field is required.");
                  return;
                }
                setIsConfirmed(true);
              }}
            >
              Continue
            </button>
          ) : (
            <div className={styles.confirmReturn}>
              <p>Are you sure you want to request a return?</p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.returnButton}
                  onClick={() => requestReturn.mutate()}
                  disabled={requestReturn.isPending}
                >
                  {requestReturn.isPending ? "Submitting..." : "Yes, request return"}
                </button>
                <button
                  type="button"
                  className={styles.cancelReturnButton}
                  onClick={() => {
                    setIsConfirmed(false);
                    setReasonError("");
                  }}
                >
                  Go back
                </button>
              </div>
            </div>
          )}

          {requestReturn.isError && (
            <p className={styles.returnError}>
              {getErrorMessage(
                requestReturn.error,
                "We could not submit your return request.",
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}