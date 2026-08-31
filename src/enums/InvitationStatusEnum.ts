export const InvitationStatusEnum = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type InvitationStatusEnum =
  (typeof InvitationStatusEnum)[keyof typeof InvitationStatusEnum];
