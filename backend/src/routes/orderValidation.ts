export const orderNameRegex = /^\S+\s+\S+(?:\s+\S+)*$/;
export const orderPhoneRegex = /^0\d{10}$/;

export const calculateOrderTotals = (
  rows: Array<{ quantity: number | string; total_price: number | string }>,
) => {
  return rows.reduce(
    (totals, item) => ({
      quantity: totals.quantity + Number(item.quantity),
      totalPrice: totals.totalPrice + Number(item.total_price),
    }),
    { quantity: 0, totalPrice: 0 },
  );
};
