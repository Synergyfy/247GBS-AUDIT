export type AdminUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  role?: string;
  status?: string;
  tokens?: number;
  createdAt?: string;
};

export type AdminUsersResponse = AdminUser[];

export default AdminUsersResponse;
