export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: string;
  joinDate?: string;
  avatar?: string;
};

export type AdminUsersResponse = AdminUser[];

export default AdminUsersResponse;
