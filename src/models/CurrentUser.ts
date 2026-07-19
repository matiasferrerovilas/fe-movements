import type { UserTypeEnum } from "@/enums/UserTypeEnum";

export interface CurrentUserMetadata {
  isFirstLogin: boolean;
  hasSeenTour: boolean;
  userRole: string[];
}

export interface CurrentUser {
  id: number | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  userType: UserTypeEnum | null;
  metadata: CurrentUserMetadata;
}
