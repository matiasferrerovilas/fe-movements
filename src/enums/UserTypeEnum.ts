// enums/UserTypeEnum.ts
export const UserTypeEnum = {
  CONSUMER: "CONSUMER",
  COMPANY: "COMPANY",
} as const;

export type UserTypeEnum = (typeof UserTypeEnum)[keyof typeof UserTypeEnum];
