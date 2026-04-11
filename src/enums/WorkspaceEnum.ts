export const WorkspaceEnum = {
  DEFAULT: "DEFAULT",
} as const;
export type WorkspaceEnum = (typeof WorkspaceEnum)[keyof typeof WorkspaceEnum];
