import protectedApi from "./protectedApi";

export const MIN_ADDRESS_LENGTH = 10;
export const MAX_ADDRESS_LENGTH = 500;

export interface CheckoutInfo {
  quantity: number;
  totalPrice: number;
  address: string | null;
  phone_number: string | null;
  fullName: string | null;
}

export interface CreateOrderData {
  fullName: string;
  phoneNumber: string;
  address: string | null;
}

export const fetchCheckoutInfo = async (): Promise<CheckoutInfo> => {
  const res = await protectedApi.get("/api/fetch-checkout-info");
  return res.data.checkoutInfo;
};

export const createOrder = async (orderData: CreateOrderData) => {
  const res = await protectedApi.post("/api/orders", orderData);
  return res.data;
};
