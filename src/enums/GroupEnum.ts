export const GroupEnum = {
  DEFAULT: "DEFAULT",
} as const;
export type GroupEnum = (typeof GroupEnum)[keyof typeof GroupEnum];
