# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New onboarding intro screen (`IntroOnboarding`): a first, form-free step before the setup wizard
  that states the app's value proposition (budgets with alerts, savings goals, spending insights,
  real-time shared workspaces, multi-bank/multi-currency) with a single "Empezar" CTA.

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
