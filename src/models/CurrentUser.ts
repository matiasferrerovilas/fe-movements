export interface CurrentUser {
  id: number | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  isFirstLogin: boolean;
  userType: string | null;
  hasSeenTour: boolean;
}
