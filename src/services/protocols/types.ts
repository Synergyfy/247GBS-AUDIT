export interface SecurityStatus {
  is2FAEnabled: boolean;
  passwordStrength: string;
  lastLogin: string;
  masterKeyActive: boolean;
}

export interface NotificationSetting {
  title: string;
  desc: string;
  active: boolean;
}

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
