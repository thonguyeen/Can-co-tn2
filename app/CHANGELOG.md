# Changelog

All notable changes to this project will be documented in this file.

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
