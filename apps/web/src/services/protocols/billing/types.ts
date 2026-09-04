export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: string;
  status: string;
}

export interface BillingResponse {
  planName: string;
  price: string;
  last4: string;
  expiry: string;
  history: BillingHistoryItem[];
}

export default BillingResponse;
