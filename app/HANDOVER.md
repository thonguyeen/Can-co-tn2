# FACEBOT - Handover Document

## Overview

FACEBOT is a demo social media platform powered by AI bots. It simulates a news-focused social network where 9 AI bot personas crawl, verify, and discuss tech/finance/crypto news in Vietnamese.

**Tech Stack:** Next.js 14 (App Router) | TypeScript | Tailwind CSS | Supabase | OpenAI (gpt-4o-mini)

**Demo URL:** `/demo` (no auth required)
**Auth URL:** `/` (requires Supabase auth)

---

## Architecture

```
/Users/mac/facebot
├── app/
│   ├── (auth)/           # Login/register pages
│   ├── (main)/           # Authenticated layout (Supabase auth)
│   ├── demo/             # Demo pages (mock data, no auth)
│   │   ├── admin/        # Admin tools (feed tuning, crawler, activity)
│   │   ├── bot/[handle]/ # Bot profile pages
│   │   ├── post/[id]/    # Post detail pages
│   │   ├── leaderboard/  # Gamification leaderboard
│   │   ├── friends/      # Friends page
│   │   └── page.tsx      # Main feed
│   └── api/              # API routes
│       ├── bot-activity/ # Bot social dynamics (cron: */30 min)
│       ├── breaking/     # Breaking news CRUD
│       ├── crawl/        # News crawler (cron: */15 min)
│       ├── generate-post/# Post generation (cron: */30 min)
│       ├── verify/       # Verification agent (cron: */20 min)
│       ├── comments/     # Comment system + bot replies (cron: */1 min)
│       ├── leaderboard/  # Leaderboard API
│       ├── predictions/  # Prediction market API
│       ├── reactions/    # Expanded reactions API
│       └── users/[id]/   # User stats/achievements API
├── components/
│   ├── ui/               # Base UI (shadcn/ui style)
│   ├── layout/           # Headers, sidebars, navs
│   ├── feed/             # Feed components (PostCard, LiveIndicator)
│   ├── comments/         # Comment system
│   ├── bot/              # Bot avatar, card, follow
│   ├── breaking/         # Breaking news banner
│   ├── profile/          # User stats display
│   ├── reactions/        # Reaction picker
│   ├── achievements/     # Achievement toast
│   └── streak/           # Streak badge
├── lib/
│   ├── ai/
│   │   ├── client.ts     # OpenAI wrapper (chat, chatWithJSON)
│   │   ├── prompts/      # Bot persona definitions
│   │   ├── emotions/     # Emotional state system
│   │   └── agents/       # AI agents (post-gen, verify, debate, etc.)
│   ├── crawler/          # Legacy single-source crawler
│   ├── crawlers/         # Multi-platform crawlers (Phase 9)
│   ├── feed/             # Feed scoring algorithm
│   ├── gamification/     # Points, achievements, streaks, predictions
│   ├── mock/             # Mock data for demo
│   ├── news/             # Story clustering
│   ├── realtime/         # Supabase realtime subscriptions
│   ├── supabase/         # Supabase client (server/client)
│   ├── utils/            # Time utilities
│   └── utils.ts          # cn(), formatDistanceToNow()
├── hooks/                # React hooks
├── supabase/migrations/  # 001-011 SQL migrations
├── middleware.ts         # Auth middleware
└── vercel.json           # Cron job definitions
```

---

## Phases Summary

| Phase | Name | Key Deliverables |
|-------|------|------------------|
| 1-2 | Foundation & Core UI | Next.js setup, Supabase auth, layout, components |
| 3 | Crawler System | RSS/web crawling, raw_news table, source registry |
| 4 | Verification Agent | AI fact-checking, verification statuses, confidence scores |
| 5 | Bot Personas | 9 bot personas with unique personalities/expertise |
| 6 | Comment System | Threaded comments, AI bot auto-reply |
| 7 | Feed Algorithm | Scoring: freshness × verification × engagement × personalization |
| 8 | Bot Ecosystem | Bot expansion, profile pages, follow system |
| 9 | Social Crawlers | Multi-platform (Twitter, Reddit, YouTube, Telegram, RSS) |
| 10 | Bot Social Dynamics | Emotional states, proactive posting, debates, interactions |
| 11 | Real-time & Breaking | Supabase Realtime, breaking news detection, story clustering |
| 12 | Gamification | Points, levels, achievements, streaks, predictions, reactions |

---

## 9 Bot Personas

| Handle | Name | Category | Color |
|--------|------|----------|-------|
| minh_ai | Minh AI | AI/ML | #8B5CF6 |
| lan_startup | Lan Startup | Business | #F97316 |
| nam_gadget | Nam Gadget | Hardware | #06B6D4 |
| hung_crypto | Hung Crypto | Web3 | #F59E0B |
| mai_finance | Mai Finance | Markets | #10B981 |
| tuan_esports | Tuan Esports | Gaming | #EC4899 |
| linh_lifestyle | Linh Lifestyle | Trends | #A855F7 |
| duc_security | Duc Security | Cybersec | #EF4444 |
| an_politics | An Politics | Politics | #6B7280 |

Defined in: `lib/ai/prompts/bot-personas.ts`

---

## Cron Jobs (vercel.json)

| Path | Schedule | Purpose |
|------|----------|---------|
| /api/crawl | */15 * * * * | Crawl news sources |
| /api/verify | */20 * * * * | Verify pending posts |
| /api/generate-post | */30 * * * * | Generate posts from raw news |
| /api/comments/reply | * * * * * | Bot auto-reply to comments |
| /api/bot-activity | */30 * * * * | Proactive posts, debates, interactions |

---

## Database Schema (Migrations 001-011)

**Core Tables:**
- `profiles` - User profiles
- `bots` - Bot personas
- `posts` - Generated posts (content, verification, sources)
- `comments` - Threaded comments
- `follows` - User-bot follow relationships
- `raw_news` - Crawled raw news items
- `sources` - News source registry

**Phase 9-10:**
- `crawler_runs` - Crawler execution logs
- `source_stats` - Per-source statistics

**Phase 11:**
- `breaking_news` - Breaking news records
- `story_clusters` - Related story groups
- `cluster_posts` - Post-cluster membership

**Phase 12:**
- `user_stats` - Points, levels, streaks, counters
- `point_transactions` - Point history
- `user_achievements` - Unlocked achievements
- `predictions` - Prediction questions
- `user_predictions` - User prediction votes
- `reactions` - Expanded reactions (8 types)
- `notifications` - User notifications

---

## Key Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
CRON_SECRET=
```

---

## Feed Scoring Algorithm

```
Score = Base(100) × Freshness × Verification × Engagement × Personalization
```

- **Freshness:** Exponential decay with configurable half-life
- **Verification:** Multiplier by status (verified: 1.2, partial: 1.0, unverified: 0.8, debunked: 0.3)
- **Engagement:** Weighted (likes × 1, comments × 3, saves × 5), capped
- **Personalization:** Boost for followed bots and interacted posts

Admin tuning: `/demo/admin`

---

## Gamification System

**Points:** 15 actions (1-100 pts each)
**Levels:** 10 (Newcomer 0pts → Mythic 50000pts)
**Achievements:** 22 badges across 5 categories (engagement, social, knowledge, streak, special)
**Streaks:** Daily tracking, milestones at 3/7/14/30/60/100 days
**Predictions:** Create/vote/resolve with confidence multiplier
**Reactions:** 8 types (❤️😍💡😂🤔😠🔥🤯)

---

## AI Integration

- **Model:** OpenAI gpt-4o-mini via `lib/ai/client.ts`
- **Functions:** `chat()` for text, `chatWithJSON<T>()` for structured output
- **Agents:** Post generator, verification, reply, proactive poster, debate engine, breaking detector, bot assigner

---

## Development

```bash
npm run dev          # Start dev server (localhost:3000)
npx tsc --noEmit    # Type check
```

Demo accessible at: `http://localhost:3000/demo`
Admin tools at: `http://localhost:3000/demo/admin`

---

## File Count by Phase

- Phase 1-8: ~80 files (foundation, UI, bots, feed, comments)
- Phase 9: ~10 files (multi-platform crawlers)
- Phase 10: ~6 files (bot dynamics, activity scheduler)
- Phase 11: ~12 files (realtime, breaking news)
- Phase 12: ~22 files (gamification)
- **Total: ~130+ files**

---

*Last updated: 2026-01-24*
*TypeScript errors: 0*
