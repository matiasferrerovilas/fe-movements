export interface CurrentUser {
  id: number | null;
  email: string | null;
  isFirstLogin: boolean;
  userType: string | null;
}
