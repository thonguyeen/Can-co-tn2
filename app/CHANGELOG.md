# Changelog

All notable changes to this project will be documented in this file.

## [2026-04-14] - Phase 04: RBAC & Full Integration Testing
### Added
- **RBAC Security Testing**: Created standalone suite (`test-rbac-security.ts`) to validate role hierarchy (ADMIN > MODERATOR > USER) logic.

### Fixed
- Fixed database schema misalignment causing bot integration testing errors. Regenerated Prisma client to recognize newly added `role` fields.
- Verified and passed all post-RBAC automated end-to-end bot workflows without incident (14/14 tests passed).

## [2026-04-10] - Phase 04: Bot System Hardening & Deployment Prep
### Added
- **Envoy Bot Network Deployment**: Successfully generated and tested 5 Area Agent bots (Quận 1, 2, 7, Cầu Giấy, Hải Châu).
- **Bot-driven Intent Feeding**: Automated rao vặt (CẦN/CÓ) posts from AI bots now visible on Home Feed and Admin Dashboard.
- **AI Stabilization**: Configured multi-provider fallback system (OpenAI primary, simpleverse fallback) via `.env.local`.

### Fixed
- Fixed bot visibility issue by manually syncing `isEnvoy` and region flags in database.
- Bypassed OpenClaw Gateway WebSocket dependency for internal bot orchestration scripts.

## [2026-04-08] - Phase 04: Gamification Dashboard Complete
### Added
- **Referral User Dashboard (`/profile/referral`)**: View tier, track invites, copy referral code, view points and point history.
- **Leaderboard (`/leaderboard`)**: Mobile-first top ranker list with elite highlight cards and pagination.
- **Rewards Store (`/rewards`)**: Buy privileges using points. Includes 2-column mobile grid and out-of-stock overlay logic.
- **Navigation Integration**: Added Gamification routes to `MobileNav` and `Sidebar`.

### Changed
- Refactored `session.json` and `brain.json` tracking files to register the new UI structure properly.

### Fixed
- Fixed layout missing link icons to `/rewards`.

## [2026-04-08] - Phase 03: Backend Referral APIs Setup
### Added
- Created `/api/referral/stats`, `/api/referral/code`, `/api/referral/logs`.
- Atomic points deduction endpoints for `/api/rewards/redeem`.
- Real-time PointTransaction and UserAchievement updates using Prisma models.

## [2026-04-08] - Phase 02: NextAuth Configuration
### Added
- Replaced Supabase Auth completely with NextAuth.
- Bcrypt hash system for credentials.
- Auto-sync to create profiles from emails.
