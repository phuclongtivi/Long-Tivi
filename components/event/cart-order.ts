export type CartLine = {
  productId: string;
  name: string;
  qty: number;
  priceVnd: number;
  verified?: boolean;
};

export type Fulfillment = {
  receiverName: string;
  phone: string;
  address: string;
  payment: "cod" | "transfer" | "card-visa-master" | "zalopay" | "momo" | "";
  payStatus: "unpaid" | "pending" | "paid";
  shipStatus: "none" | "preparing" | "shipping" | "delivered";
  eta?: string;
};

export type CartOrder = {
  confirmed: boolean;
  lines: CartLine[];
  fulfill: Fulfillment;
};

export function canEditLines(order: CartOrder): boolean {
  return !order.confirmed;
}

export function canEditFulfill(order: CartOrder): boolean {
  return !order.confirmed;
}

export function confirmOrder(order: CartOrder): CartOrder {
  const f = order.fulfill;
  if (!f.receiverName || !f.phone || !f.address || !f.payment) {
    throw new Error("Thiếu thông tin đơn hàng");
  }
  return {
    ...order,
    confirmed: true,
    fulfill: {
      ...f,
      payStatus: f.payment === "cod" ? "pending" : "pending",
      shipStatus: "preparing",
    },
  };
}
