// enums/UserTypeEnum.ts
export const UserTypeEnum = {
  PERSONAL: "PERSONAL",
  ENTERPRISE: "ENTERPRISE",
} as const;

export type UserTypeEnum = (typeof UserTypeEnum)[keyof typeof UserTypeEnum];
