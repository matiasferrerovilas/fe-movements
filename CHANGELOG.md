# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `useInvitationSubscription` subscribed to `/topic/invitation/{userId}/new` (singular, keyed by
  numeric user id), but api-movements publishes new invitations to `/topic/invitations/{email}/new`
  (plural, keyed by email — see `WebSocketTopics.invitationsNew`) — a receiving user had to hit F5
  to see an invitation that had, in fact, already arrived over the wire. Fixed to subscribe by
  email on the real topic.
- `useWorkspacesSubscription` subscribed to STOMP topics (`/topic/account/...`) and an event type
  (`ACCOUNT_LEFT`) that api-movements never publishes — nothing backend-side has emitted to that
  prefix, so accepting an invitation never refreshed the inviter's member list, and being kicked
  never refreshed the removed user's workspace list, live. Rewired to the real topics
  api-movements actually pushes to: `/topic/workspace/{workspaceId}/members/update`
  (`MEMBERSHIP_UPDATED`, on invitation accepted) and `/topic/membership/{email}/remove`
  (`WORKSPACE_LEFT`, on kick/leave — keyed by email, not workspaceId, matching how the backend
  addresses it). Both now just invalidate the `user-workspaces` query instead of trying to merge a
  full `Workspace` object into the cache, since neither event actually carries one.

### Added
- Bell notification on `INVITATION_ADDED`: `useInvitationSubscription` now also pushes an entry
  into the notification bell's cache (`NOTIFICATIONS_QUERY_KEY`) when a workspace invitation
  arrives live, in addition to updating the invitations list — so the invited user notices it
  without having the invitations page open. New i18n keys
  `common.notifications.invitationReceived{Title,Message}`.
- Remove-member button in the workspace member list (Settings → Workspace): visible only when the
  authenticated user is the workspace's `OWNER` or has the global `ADMIN` role, and never on their
  own row. New `RemoveMemberButton` component, `removeWorkspaceMemberApi`, and `memberDetails` on
  `WorkspaceMetadata` (userId/email/role per member, needed to target the DELETE call).
- New onboarding intro screen (`IntroOnboarding`): a first, form-free step before the setup wizard
  that states the app's value proposition (budgets with alerts, savings goals, spending insights,
  real-time shared workspaces, multi-bank/multi-currency) with a single "Empezar" CTA.
- New `FirstMovementCta` banner on the home screen: shown only when the user has no expenses logged
  this year, with a large button that opens the add-movement modal (description field auto-focused).
  Closes the loop the onboarding wizard used to leave open. `AddMovementModal` gained an optional
  `trigger` render-prop to support the custom button without duplicating its form logic.
- Matching `MovementsEmptyState` on the `/movements` page: when the account has no movements and no
  filters are active, the table/pagination/Card are replaced by a large "add your first movement" CTA
  instead of an empty table.

### Removed
- Investments feature entirely: the `/investments` route, dashboard, table/form components, settings
  tab, API client, hooks, WebSocket subscription, and all related i18n copy and nav entries.

## [2.3.0] - 2026-08-18

### Added
- Savings Goals page: list of goals as cards with a progress bar, create/edit modal, and a quick
  "add contribution" action. Wired into navigation and fully bilingual (es/en).
- Spending insights card on the home dashboard, listing categories that deviate significantly from
  the 6-month average.
- Financial projection chart on the home dashboard (Recharts line chart), showing a conservative
  projected balance trend for the next 3/6/12 months.
- Reusable `useUndoableDelete` hook: deletions across movements, budgets, services/subscriptions,
  banks, and categories now show a "Deshacer" (Undo) notification and hold the actual API call for a
  few seconds instead of firing immediately. Items show as greyed-out/disabled during the undo window.
- Bulk actions on the movements table: multi-select checkboxes, a selection toolbar with bulk delete
  and bulk categorize (both fan out to the existing single-item endpoints via `Promise.allSettled`,
  no new backend endpoints), and a summary toast on completion.
- CI step to auto-tag `main` with `vX.Y.Z` (read from `package.json`) after a successful build, skipped
  if the tag already exists.

## [2.2.0]
### Added
- STOMP/WebSocket connection fixes for real-time updates.
- Translation pass (i18next) across the app.

## [2.1.0]
### Added
- In-app notifications (bell icon, notification list).
- Navbar redesign.

## [2.0.0]
### Added
- Multiple categories per movement (up to 2), matching the backend's `movement_categories` model.
- Investments page with live valuation and a time-deposit calculator.
- Help page content pass.

## [1.0.x] and earlier
### Added
- Initial React + TypeScript + Vite + Ant Design app: movements table with filters, CSV/PDF export,
  bank statement import, budgets (monthly/annual/one-time) with alerts, subscriptions/services with
  payment tracking, recurring income, shared workspaces with role-based access and invitations,
  Keycloak login, dashboard with monthly summary, top categories, category pie chart and annual
  evolution chart.

[Unreleased]: https://github.com/matiasferrerovilas/fe-movements/compare/v2.3.0...HEAD
[2.3.0]: https://github.com/matiasferrerovilas/fe-movements/compare/v2.2.0...v2.3.0
