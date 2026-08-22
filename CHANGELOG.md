# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Gamification UI: the backend's `GET /v1/gamification/streak` and `GET /v1/gamification/badges`
  had no frontend caller anywhere — the streak/badges data existed but pushed nothing.
  - `StreakBanner`: a small pill under the "Bienvenido" header showing days logged in a row
    (fire icon), with distinct copy for an active streak, a broken one that still shows the
    record, and a first-time nudge when there's no streak yet at all.
  - `BadgesPanel`: a new home-dashboard card listing budget-met badges (category + month earned),
    self-hiding when there are none yet — mirrors `InsightsPanel`'s visibility pattern rather than
    `GoalsPanel`'s always-shown-with-empty-state one, since there's no action to take from an
    empty badges list.
  - New `src/models/Gamification.ts`, `src/apis/GamificationApi.ts`,
    `src/apis/hooks/useGamification.ts` (`useStreak`, `useBadges`) — both endpoints resolve the
    workspace server-side, same implicit pattern as Budgets, so neither hook takes a `workspaceId`.
  - Annual budgets (fixed year, no month) are intentionally excluded from the badge count on the
    backend, to avoid awarding a redundant one every month — no frontend copy claims otherwise.

### Changed
- `AppsGrid` no longer links to Keep for a GUEST user — Keep is a family-scoped app (matching the
  new `ADMIN`/`FAMILY`-only access gate added on api-keep and fe-keep this round); the link only
  used to lead to a 403 for that role, now it's just not shown.

### Changed — `/services` visual redesign
- `ServiceSummary`: replaced the 3 identical stat cards (Total/Pagados/Pendientes) with one
  composed panel — a sentence-style headline ("$X pendientes de $Y en total"), a progress bar
  showing paid vs. pending proportion, and paid/pending counts below it. A celebratory "¡Estás al
  día!" state replaces the panel entirely once nothing is pending.

  The rest of the redesign (amber `ServiceCard` styling, the collapsible ghost-card
  `ServiceCardForm`, and the pending/paid section split on `/services`) didn't land well and was
  reverted — those three files and the page route are back to how they were before this round,
  only `ServiceSummary` stayed.

### Fixed

- Console warning surfaced while testing the new `ServiceSummary`: antd v6 deprecated
  `Progress.trailColor` in favor of `railColor` (also renamed `WorkspaceSelector`'s pre-existing
  `Select.dropdownRender` → `popupRender` while in the area).
- Removed every remaining use of antd's deprecated `List`/`List.Item`/`List.Item.Meta` across the
  project (`SettingCurrentWorkspace`, `GoalsPanel`, `InsightsPanel`, `NotificationBell`,
  `TopCategories`) — antd has no direct replacement component, so each was hand-rolled as a
  semantic `<ul>`/`<li>` with the same borders/padding/spacing `List` used to apply via CSS
  (`role="listitem"` preserved for accessibility and for `TopCategories`' existing test, which
  asserts on it). `NotificationBell` additionally lost `List.Item.Meta`'s avatar/title/description
  layout, rebuilt with a plain `Flex`.
- Replaced the only use of antd's deprecated `Dropdown.Button` (the CSV/PDF export split button in
  `MovementFilters`) with the recommended `Space.Compact + Dropdown + Button` — a plain `Button`
  (CSV export, unchanged `onClick`/`loading`) compact-joined with a `Dropdown` wrapping an
  icon-only `Button` as the menu trigger, same `menu.items`/`onClick` for the PDF option.

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

### Changed
- `MovementsEmptyState` ("¿Empezamos?" CTA on `/movements` with no expenses yet) now fills most of
  the viewport height (`minHeight: calc(100vh - 240px)`, content vertically centered) instead of a
  small fixed-padding box, so it reads as the page's actual content instead of a shrunken banner.
- `/services` with no services no longer shows the "Total/Pagados/Pendientes" summary row — those
  stats are all zero and just add noise before there's anything to summarize. Shown again as soon
  as the first service is added.

### Added
- New `ServicesEmptyState` ("¿Empezamos?" hero, `services.labels.emptyState{Title,Subtitle}`,
  PERSONAL/ENTERPRISE-aware like the rest of `getServiceLabels`) shown on `/services` when there are
  no services yet, filling most of the page instead of leaving just the small add-service form
  sitting in an otherwise empty grid. The add-service form (`ServiceCardForm`) now renders *inside*
  this block, centered below the text, instead of as a separate card floating below it — only for
  the empty case; once at least one service exists, the page is unchanged (form stays as the first
  grid card next to the service list, as before).
- `ServiceCardForm` now guards on missing currencies the same way `AddMovementModal` already did
  for movements: if the workspace has no currency configured yet, it shows an alert ("Necesitás una
  moneda para continuar") with a button to `/settings?tab=finanzas` instead of the actual add form.
  (Unlike movements, services don't need a bank — `ServiceCardForm` has no bank field — so only the
  currency check applies.) New `services.form.noCurrency{Title,Description,Cta}` i18n keys.
- `PendingDeleteIndicator`: a small spinning badge shown on any card mid-"undo delete" window
  (`useUndoableDelete`'s `isPendingRemoval`), across services, goals, budgets, banks, categories,
  and movements (all 3 responsive table views). Previously the item just dimmed/grayed out with no
  motion, which read as frozen and invited a second click.
- Workspaces named `DEFAULT` (the backend's convention for a user's personal workspace) now display
  as "Personal" in the workspace selector, workspace settings, service tags, and invitation cards
  (`getWorkspaceDisplayName`). When the currently-viewed personal workspace belongs to someone else
  (you're a collaborator there, not the `OWNER`) — e.g. after accepting an invite to their
  `DEFAULT` — the workspace selector shows "Personal (their@email)" and the workspace settings page
  shows a "No es tuyo" tag with a tooltip naming the owner, so it's not confused for your own.
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
