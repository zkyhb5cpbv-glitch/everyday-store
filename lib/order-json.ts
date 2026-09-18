export type OrderReceipt = {
  schemaVersion: 1;
  id: string;
  createdAt: string;
  mode: 'test';
  status: 'saved';
  currency: 'USD';
  totalCents: number;
  items: Array<{id: string; name: string; price: number; quantity: number}>;
  contact: {fullName: string; email: string; phone: string};
  shipping: {addressLine1: string; addressLine2: string; city: string; region: string; postalCode: string; country: string};
  payment: {status: 'not_charged'; token: string; brand: 'visa'; last4: string; expiry: string};
};

// Called only with the receipt returned after a successful database insert.
export function downloadOrderJson(receipt: OrderReceipt) {
  const blob = new Blob([JSON.stringify(receipt, null, 2) + '\n'], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `order-${receipt.id}.json`;
  document.body.appendChild(link);
  try { link.click(); }
  finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
