import protectedApi from "./protectedApi";

export interface PendingOrdersInfo {
  quantity: number;
  totalPrice: number;
}

export interface ConfirmedOrderInfo {
  order_uuid: string;
  total_price: number;
  created_at: string;
  status: string;
}

export type DeliveredOrderInfo = ConfirmedOrderInfo;

export interface DeliveredOrderItemInfo {
  product_id: number;
  order_uuid: string;
  return_status: string | null;
}

export const fetchPendingOrders = async (): Promise<PendingOrdersInfo> => {
  const res = await protectedApi.get("/api/pending-orders");
  return res.data.info;
};

export const fetchConfirmedOrders = async (): Promise<ConfirmedOrderInfo[]> => {
  const res = await protectedApi.get("/api/confirmed-orders");
  return res.data.confirmedOrders;
};

export const fetchDeliveredOrders = async (): Promise<DeliveredOrderInfo[]> => {
  const res = await protectedApi.get("/api/delivered-orders");
  return res.data.deliveredOrders;
};

export const fetchDeliveredOrderItems = async (
  orderUuid: string,
): Promise<DeliveredOrderItemInfo[]> => {
  const res = await protectedApi.get(
    `/api/delivered-orders/${orderUuid}/items`,
  );
  return res.data.items;
};

export const cancelPendingOrders = async () => {
  const res = await protectedApi.delete("/api/cancel-pending-orders");
  return res.data;
};

export const cancelConfirmedOrder = async (orderUuid: string) => {
  const res = await protectedApi.delete(
    `/api/confirmed-orders/${orderUuid}/cancel`,
  );
  return res.data;
};
