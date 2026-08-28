export interface UserProfile {
  id: number;
  loginId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  company: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
