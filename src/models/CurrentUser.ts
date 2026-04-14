import type { UserTypeEnum } from "../enums/UserTypeEnum";

export interface CurrentUser {
  id: number | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  isFirstLogin: boolean;
  userType: UserTypeEnum | null;
  hasSeenTour: boolean;
}
