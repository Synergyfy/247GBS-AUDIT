export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  phone?: string;
  location?: string;
  website?: string;
  tokens?: number;
}

export default UserProfile;
