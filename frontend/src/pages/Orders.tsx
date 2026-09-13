import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Orders.module.css";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import {
  cancelConfirmedOrder as cancelConfirmedOrderRequest,
  cancelPendingOrders,
  fetchConfirmedOrders,
  fetchDeliveredOrderItems,
  fetchDeliveredOrders,
  fetchPendingOrders,
} from "../api/ordersApi";
import ConfirmedOrderItems from "../components/ConfirmedOrders";
import DeliveredOrderItems from "../components/DeliveredOrders";
import PendingOrderItems from "../components/PendingOrderItems";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import InlineDropdown from "../components/InlineDropdown";
import { useAuth } from "../context/useAuth";
import LoginPrompt from "../components/LoginPrompt";
import { getErrorMessage } from "../lib/getErrorMessage";

type OrderStatus = "delivered" | "inProgress" | "pending";

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeStatus, setActiveStatus] =
    useState<OrderStatus>("delivered");

  const [showOrderItems, setShowOrderItems] =
    useState<string | null>(null);

  const [returnOrder, setReturnOrder] = useState<string | null>(null);

  const [trackingOrder, setTrackingOrder] =
    useState<string | null>(null);

  const queryClient = useQueryClient();

  const {
    data: pendingOrders,
    isLoading: loading,
    isError,
    error: pendingOrdersErrorObj,
  } = useQuery({
    queryKey: ["pending"],
    queryFn: fetchPendingOrders,
    enabled: isAuthenticated,
  });

  const cancelOrders = useMutation({
    mutationFn: cancelPendingOrders,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending"],
      });
    },
  });

  const {
    data: confirmedOrders,
    isLoading: confirmedOrdersLoading,
    isError: confirmedOrdersError,
    error: confirmedOrdersErrorObj,
  } = useQuery({
    queryKey: ["confirmed"],
    queryFn: fetchConfirmedOrders,
    enabled: isAuthenticated,
  });

  const {
    data: deliveredOrders,
    isLoading: deliveredOrdersLoading,
    isError: deliveredOrdersError,
    error: deliveredOrdersErrorObj,
  } = useQuery({
    queryKey: ["delivered"],
    queryFn: fetchDeliveredOrders,
    enabled: isAuthenticated,
  });

  const deliveredItemQueries = useQueries({
    queries: isAuthenticated
      ? (deliveredOrders ?? []).map((order) => ({
      queryKey: ["delivered-items", order.order_uuid],
      queryFn: () => fetchDeliveredOrderItems(order.order_uuid),
      }))
      : [],
  });

  const cancelConfirmedOrder = useMutation({
    mutationFn: cancelConfirmedOrderRequest,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["confirmed"],
      });
    },
  });

  if (authLoading) {
    return <LoadingState label="Loading your orders" />;
  }

  if (!isAuthenticated) {
    return (
      <main className={styles.ordersPage}>
        <LoginPrompt
          title="Log in to view your orders"
          message="Please log in to access your order history and status."
        />
      </main>
    );
  }

  if (confirmedOrdersLoading) {
    return <LoadingState label="Loading confirmed orders" />;
  }

  if (confirmedOrdersError) {
    return (
      <ErrorState
        label={getErrorMessage(confirmedOrdersErrorObj, "Unable to load confirmed orders")}
      />
    );
  }

  if (deliveredOrdersLoading) {
    return <LoadingState label="Loading delivered orders" />;
  }

  if (deliveredOrdersError) {
    return (
      <ErrorState
        label={getErrorMessage(deliveredOrdersErrorObj, "Unable to load delivered orders")}
      />
    );
  }

  return (
    <main className={styles.ordersPage}>
      <div className={styles.ordersContainer}>
        <h1 className={styles.title}>My Orders</h1>

        <div className={styles.statusBar}>
          <div className={styles.mobileStatusDropdown}>
            <InlineDropdown
              id="order-status"
              label="Order status"
              value={activeStatus}
              options={[
                { value: "delivered", label: "Delivered Orders" },
                { value: "inProgress", label: "Orders in Progress" },
                { value: "pending", label: "Pending Orders" },
              ]}
              onChange={setActiveStatus}
            />
          </div>

          <button
            type="button"
            className={`${styles.statusItem} ${
              activeStatus === "delivered" ? styles.active : ""
            }`}
            onClick={() => setActiveStatus("delivered")}
          >
            <span className={styles.statusTitle}>
              Delivered Orders
            </span>

            <span className={styles.statusDescription}>
              Orders that have been successfully delivered to you.
            </span>
          </button>

          <button
            type="button"
            className={`${styles.statusItem} ${
              activeStatus === "inProgress" ? styles.active : ""
            }`}
            onClick={() => setActiveStatus("inProgress")}
          >
            <span className={styles.statusTitle}>
              Orders in Progress
            </span>

            <span className={styles.statusDescription}>
              Orders that are currently being processed.
            </span>
          </button>

          <button
            type="button"
            className={`${styles.statusItem} ${
              activeStatus === "pending" ? styles.active : ""
            }`}
            onClick={() => setActiveStatus("pending")}
          >
            <span className={styles.statusTitle}>
              Pending Orders
            </span>

            <span className={styles.statusDescription}>
              Orders that are currently waiting for payment.
            </span>
          </button>
        </div>

        <section className={styles.orderContent}>
          {activeStatus === "delivered" && (
            <>
              <div className={styles.confirmedOrders}>
                {deliveredOrders?.map((order) => (
                  (() => {
                    const itemQuery = deliveredItemQueries.find(
                      (query) => query.data?.[0]?.order_uuid === order.order_uuid,
                    );
                    const orderItems = itemQuery?.data ?? [];
                    const hasReturnedItems = orderItems.some(
                      (item) => item.return_status,
                    );
                    const isFullyReturned =
                      orderItems.length > 0 &&
                      orderItems.every((item) => item.return_status);
                    const isFullyAccepted =
                      orderItems.length > 0 &&
                      orderItems.every((item) => item.return_status === "accepted");

                    return (
                  <div
                    className={`${styles.confirmedCard} ${
                      isFullyReturned ? styles.returnedOrderCard : ""
                    }`}
                    key={order.order_uuid}
                  >
                    {returnOrder === order.order_uuid ? (
                      <div className={styles.orderItemsView}>
                        <div className={styles.orderItemsHeader}>
                          <span className={styles.orderItemsTitle}>
                            Request a return
                          </span>

                          <button
                            type="button"
                            className={styles.hideItemsButton}
                            onClick={() => setReturnOrder(null)}
                          >
                            Close
                          </button>
                        </div>

                        <DeliveredOrderItems
                          order_uuid={order.order_uuid}
                          returnMode
                        />
                      </div>
                    ) : showOrderItems === order.order_uuid ? (
                      <div className={styles.orderItemsView}>
                        <div className={styles.orderItemsHeader}>
                          <span className={styles.orderItemsTitle}>
                            Order Items
                          </span>

                          <button
                            type="button"
                            className={styles.hideItemsButton}
                            onClick={() => setShowOrderItems(null)}
                          >
                            Hide
                          </button>
                        </div>

                        <DeliveredOrderItems order_uuid={order.order_uuid} />
                      </div>
                    ) : (
                      <>
                        <div className={styles.confirmedTop}>
                          <div>
                            <span className={styles.infoLabel}>Order</span>
                            <span className={styles.orderUuid}>
                              #{order.order_uuid.slice(0, 8)}
                            </span>
                          </div>

                          <span
                            className={
                              isFullyAccepted
                                ? styles.returnedStatus
                                : hasReturnedItems
                                  ? styles.returnProgressStatus
                                  : styles.deliveredStatus
                            }
                          >
                            {isFullyAccepted ? (
                              "Returned"
                            ) : hasReturnedItems ? (
                              <>
                                <span className={styles.returnStatusDot} />
                                Return in progress
                              </>
                            ) : (
                              "Delivered"
                            )}
                          </span>
                        </div>

                        <div className={styles.confirmedInfo}>
                          <div className={styles.confirmedInfoItem}>
                            <span className={styles.infoLabel}>Total price</span>
                            <span className={styles.infoValue}>
                              €{Number(order.total_price).toFixed(2)}
                            </span>
                          </div>

                          <div className={styles.confirmedInfoItem}>
                            <span className={styles.infoLabel}>Date</span>
                            <span className={styles.infoValue}>
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className={styles.confirmedActions}>
                          <button
                            type="button"
                            className={styles.viewButton}
                            onClick={() => {
                              setShowOrderItems(order.order_uuid);
                              setReturnOrder(null);
                            }}
                          >
                            View items
                          </button>

                          {!isFullyReturned && (
                            <button
                              type="button"
                              className={styles.returnOrderButton}
                              onClick={() => {
                                setReturnOrder(order.order_uuid);
                                setShowOrderItems(null);
                              }}
                            >
                              Request Return
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                    );
                  })()
                ))}
              </div>
            </>
          )}

          {activeStatus === "inProgress" && (
            <>
              <div className={styles.confirmedOrders}>
                {confirmedOrders?.map((order) => (
                  <div
                    className={styles.confirmedCard}
                    key={order.order_uuid}
                  >
                    {showOrderItems === order.order_uuid ? (
                      <div className={styles.orderItemsView}>
                        <div className={styles.orderItemsHeader}>
                          <span className={styles.orderItemsTitle}>
                            Order Items
                          </span>

                          <button
                            type="button"
                            className={styles.hideItemsButton}
                            onClick={() =>
                              setShowOrderItems(null)
                            }
                          >
                            Hide
                          </button>
                        </div>

                        <ConfirmedOrderItems
                          order_uuid={order.order_uuid}
                        />
                      </div>
                    ) : (
                      <>
                        <div className={styles.confirmedTop}>
                          <div>
                            <span className={styles.infoLabel}>
                              Order
                            </span>

                            <span className={styles.orderUuid}>
                              #{order.order_uuid.slice(0, 8)}
                            </span>
                          </div>

                          <span className={styles.confirmedStatus}>
                            Confirmed
                          </span>
                        </div>

                        <div className={styles.confirmedInfo}>
                          <div
                            className={styles.confirmedInfoItem}
                          >
                            <span className={styles.infoLabel}>
                              Total price
                            </span>

                            <span className={styles.infoValue}>
                              €
                              {Number(
                                order.total_price,
                              ).toFixed(2)}
                            </span>
                          </div>

                          <div
                            className={styles.confirmedInfoItem}
                          >
                            <span className={styles.infoLabel}>
                              Date
                            </span>

                            <span className={styles.infoValue}>
                              {new Date(
                                order.created_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className={styles.confirmedActions}>
                          <button
                            className={styles.viewButton}
                            onClick={() =>
                              setShowOrderItems(
                                order.order_uuid,
                              )
                            }
                          >
                            View items
                          </button>

                          <button
                            className={styles.trackButton}
                            onClick={() =>
                              setTrackingOrder(
                                trackingOrder ===
                                  order.order_uuid
                                  ? null
                                  : order.order_uuid,
                              )
                            }
                          >
                            {trackingOrder === order.order_uuid
                              ? "Hide status"
                              : "Track order"}
                          </button>

                          <button
                            className={styles.cancelButton}
                            onClick={() =>
                              cancelConfirmedOrder.mutate(
                                order.order_uuid,
                              )
                            }
                            disabled={
                              cancelConfirmedOrder.isPending
                            }
                          >
                            {cancelConfirmedOrder.isPending
                              ? "Cancelling..."
                              : "Cancel order"}
                          </button>
                        </div>

                        {trackingOrder === order.order_uuid && (
                          <div className={styles.trackingBox}>
                            <span
                              className={styles.trackingLabel}
                            >
                              Order status
                            </span>

                            <span
                              className={styles.trackingStatus}
                            >
                              {order.status}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeStatus === "pending" && (
            <>
              {loading && (
                <div className={styles.spinnerContainer}>
                  <div className={styles.spinner}></div>
                </div>
              )}

              {isError && (
                <p className={styles.errorMessage}>
                  {getErrorMessage(pendingOrdersErrorObj, "Failed to load pending orders.")}
                </p>
              )}

              {!loading &&
                !isError &&
                pendingOrders &&
                pendingOrders.quantity > 0 && (
                  <div
                    className={`${styles.pendingCard} ${
                      showOrderItems === "pending"
                        ? styles.pendingCardExpanded
                        : ""
                    }`}
                  >
                    {showOrderItems === "pending" ? (
                      <div className={styles.orderItemsView}>
                        <div className={styles.orderItemsHeader}>
                          <span className={styles.orderItemsTitle}>
                            Order Items
                          </span>

                          <button
                            type="button"
                            className={styles.hideItemsButton}
                            onClick={() => setShowOrderItems(null)}
                          >
                            Hide
                          </button>
                        </div>

                        <PendingOrderItems />
                      </div>
                    ) : (
                      <>
                        <div className={styles.pendingInfo}>
                          <span className={styles.infoValue}>
                            {pendingOrders.quantity}
                          </span>

                          <span className={styles.infoLabel}>Items</span>
                        </div>

                        <div className={styles.pendingInfo}>
                          <span className={styles.infoValue}>
                            ${pendingOrders.totalPrice.toFixed(2)}
                          </span>

                          <span className={styles.infoLabel}>Total</span>
                        </div>

                        <span className={styles.pendingStatus}>
                          Pending Payment
                        </span>

                        <div className={styles.confirmedActions}>
                          <button
                            type="button"
                            className={styles.viewButton}
                            onClick={() => setShowOrderItems("pending")}
                          >
                            View items
                          </button>

                          <button
                            type="button"
                            className={styles.checkoutButton}
                            onClick={() => navigate("/checkout")}
                          >
                            Checkout
                          </button>

                          <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => cancelOrders.mutate()}
                            disabled={cancelOrders.isPending}
                          >
                            {cancelOrders.isPending
                              ? "Cancelling..."
                              : "Cancel All"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}