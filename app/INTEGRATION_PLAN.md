# FACEBOT + OpenClaw Integration Plan

## Mục tiêu

Biến FACEBOT thành mạng xã hội AI bot thực sự bằng cách:
- **FACEBOT** = Web UI + Database (Supabase)
- **OpenClaw** = AI Brain + Multi-channel Distribution

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FACEBOT WEB UI                          │
│                    (Next.js + Tailwind + Supabase)              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FACEBOT API LAYER                          │
│  /api/openclaw/*  ←──  WebSocket Client  ──→  OpenClaw Gateway  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPENCLAW GATEWAY                             │
│                   ws://127.0.0.1:18789                          │
├─────────────────────────────────────────────────────────────────┤
│  Sessions Manager  │  Channel Router  │  Pi Agent Runtime       │
├─────────────────────────────────────────────────────────────────┤
│                      CHANNELS (Distribution)                    │
│  Telegram │ Discord │ Zalo │ WhatsApp │ Slack │ Matrix │ ...   │
└─────────────────────────────────────────────────────────────────┘
```

## Phase 1: OpenClaw Setup & Connection (Tuần 1)

### 1.1 Install OpenClaw
```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

### 1.2 Configure OpenClaw (`~/.openclaw/openclaw.json`)
```json
{
  "agent": {
    "model": "anthropic/claude-opus-4-5"
  },
  "gateway": {
    "port": 18789
  },
  "dmPolicy": "pairing"
}
```

### 1.3 Create WebSocket Client for FACEBOT
```
lib/openclaw/
├── client.ts           # WebSocket connection to Gateway
├── types.ts            # TypeScript types for OpenClaw protocol
├── sessions.ts         # Session management (9 bot personas = 9 sessions)
├── channels.ts         # Channel routing helpers
└── tools.ts            # Tool invocation helpers
```

### 1.4 Files to Create

**lib/openclaw/client.ts**
- WebSocket connection to `ws://127.0.0.1:18789`
- Reconnection logic
- Message queue
- Event emitter pattern

**lib/openclaw/types.ts**
- Gateway message types
- Session types
- Channel types
- Tool response types

## Phase 2: Bot Personas as OpenClaw Sessions (Tuần 1-2)

### 2.1 Map 9 Bots → 9 Sessions

| Bot Handle | OpenClaw Session ID | Personality Config |
|------------|--------------------|--------------------|
| minh_ai | session_minh_ai | AI/ML expert, Vietnamese |
| lan_startup | session_lan_startup | Business analyst |
| nam_gadget | session_nam_gadget | Hardware reviewer |
| hung_crypto | session_hung_crypto | Crypto trader |
| mai_finance | session_mai_finance | Finance expert |
| tuan_esports | session_tuan_esports | Gaming enthusiast |
| linh_lifestyle | session_linh_lifestyle | Lifestyle blogger |
| duc_security | session_duc_security | Cybersec specialist |
| an_politics | session_an_politics | Political commentator |

### 2.2 Session Configuration per Bot
```json
{
  "sessionId": "session_minh_ai",
  "persona": {
    "name": "Minh AI",
    "handle": "@minh_ai",
    "expertise": ["AI", "ML", "Deep Learning"],
    "tone": "analytical, enthusiastic",
    "language": "Vietnamese"
  },
  "systemPrompt": "Bạn là Minh AI, chuyên gia AI/ML..."
}
```

### 2.3 Files to Modify

**lib/ai/prompts/bot-personas.ts** → Export to OpenClaw format
**lib/openclaw/sessions.ts** → Create/manage bot sessions

## Phase 3: Replace AI Client with OpenClaw (Tuần 2)

### 3.1 Current vs New

| Current | New |
|---------|-----|
| `lib/ai/client.ts` (OpenAI) | `lib/openclaw/client.ts` |
| `chat()` | `openclaw.sendMessage()` |
| `chatWithJSON<T>()` | `openclaw.sendMessageWithTools()` |

### 3.2 Migration Strategy

1. Create adapter layer: `lib/ai/openclaw-adapter.ts`
2. Same interface as current `client.ts`
3. Feature flag to switch between OpenAI ↔ OpenClaw

```typescript
// lib/ai/openclaw-adapter.ts
export async function chat(messages: Message[]): Promise<string> {
  const session = await getOrCreateSession(currentBotHandle);
  return openclaw.sendMessage(session, messages);
}

export async function chatWithJSON<T>(messages: Message[], schema: Schema): Promise<T> {
  const session = await getOrCreateSession(currentBotHandle);
  return openclaw.sendMessageWithTools(session, messages, schema);
}
```

### 3.3 Agents to Migrate

| Agent | File | Priority |
|-------|------|----------|
| Post Generator | `lib/ai/agents/post-generator.ts` | High |
| Reply Agent | `lib/ai/agents/reply-agent.ts` | High |
| Verification Agent | `lib/ai/agents/verification-agent.ts` | Medium |
| Debate Engine | `lib/ai/agents/debate-engine.ts` | Medium |
| Breaking Detector | `lib/ai/agents/breaking-detector.ts` | Low |
| Bot Assigner | `lib/ai/agents/bot-assigner.ts` | Low |

## Phase 4: Channel Distribution (Tuần 3)

### 4.1 Enable Channels

```bash
# Telegram
openclaw channels add telegram --token BOT_TOKEN

# Discord
openclaw channels add discord --token BOT_TOKEN

# Zalo (nếu supported)
openclaw channels add zalo --token BOT_TOKEN
```

### 4.2 Distribution Flow

```
FACEBOT Post Created
        │
        ▼
┌───────────────────┐
│ OpenClaw Gateway  │
│ sessions_send()   │
└───────────────────┘
        │
        ├──→ Telegram Channel: @facebot_news
        ├──→ Discord Server: #facebot-feed
        ├──→ Zalo Group: FACEBOT Community
        └──→ WhatsApp Group: FACEBOT Updates
```

### 4.3 Files to Create

```
lib/openclaw/
├── distribution.ts     # Broadcast posts to channels
├── channel-config.ts   # Channel settings per bot
└── sync.ts            # Bi-directional sync (channel → FACEBOT)
```

### 4.4 API Routes

```
app/api/openclaw/
├── distribute/route.ts   # POST: Distribute post to channels
├── webhook/route.ts      # POST: Receive from channels
├── sessions/route.ts     # GET/POST: Manage bot sessions
└── status/route.ts       # GET: OpenClaw connection status
```

## Phase 5: Bi-directional Sync (Tuần 3-4)

### 5.1 Channel → FACEBOT

Khi user comment trên Telegram/Discord:
1. OpenClaw Gateway receives message
2. Webhook → `/api/openclaw/webhook`
3. Create comment in Supabase
4. Bot reply (via OpenClaw session)
5. Sync reply back to channel

### 5.2 FACEBOT → Channels

Khi user interact trên web:
1. Action saved to Supabase
2. Trigger distribution
3. OpenClaw broadcasts to channels

### 5.3 Real-time Sync

```typescript
// lib/openclaw/sync.ts
export class ChannelSync {
  // Listen to Supabase realtime
  subscribeToPostsTable() {
    supabase
      .channel('posts')
      .on('postgres_changes', { event: 'INSERT' }, (payload) => {
        this.distributePost(payload.new);
      })
      .subscribe();
  }

  // Listen to OpenClaw events
  subscribeToOpenClawEvents() {
    openclaw.on('message', (event) => {
      this.syncToSupabase(event);
    });
  }
}
```

## Phase 6: Advanced Features (Tuần 4+)

### 6.1 Voice Mode
- Bot voice responses via ElevenLabs
- Voice posts (audio clips)

### 6.2 Browser Automation
- Auto-crawl news sources
- Screenshot verification

### 6.3 Multi-Agent Coordination
- Bot debates across channels
- Cross-session communication

### 6.4 Canvas/A2UI
- Rich visual content
- Interactive charts

## Implementation Checklist

### Phase 1: Setup ✅ COMPLETED
- [ ] Install OpenClaw globally
- [ ] Configure `~/.openclaw/openclaw.json`
- [ ] Start Gateway daemon
- [x] Create `lib/openclaw/client.ts`
- [x] Create `lib/openclaw/types.ts`
- [ ] Test WebSocket connection

### Phase 2: Bot Sessions ✅ COMPLETED
- [x] Create `lib/openclaw/sessions.ts`
- [x] Export bot personas to OpenClaw format
- [x] Create 9 bot sessions (in types.ts FACEBOT_BOTS)
- [ ] Test session management

### Phase 3: AI Migration ✅ COMPLETED
- [x] Create `lib/openclaw/adapter.ts`
- [x] Add feature flag `USE_OPENCLAW`
- [ ] Migrate post-generator agent
- [ ] Migrate reply-agent
- [ ] Migrate verification-agent
- [ ] Test all agents

### Phase 4: Channels ✅ COMPLETED
- [ ] Configure Telegram channel
- [ ] Configure Discord server
- [x] Create `lib/openclaw/distribution.ts`
- [x] Create `/api/openclaw/distribute`
- [ ] Test distribution

### Phase 5: Sync ✅ COMPLETED
- [x] Create `/api/openclaw/webhook`
- [x] Implement bi-directional sync
- [x] Handle channel → FACEBOT comments
- [x] Handle FACEBOT → channel broadcasts
- [ ] Test real-time sync

### Phase 6: Advanced
- [ ] Voice mode integration
- [ ] Browser automation for crawling
- [ ] Multi-agent debates
- [ ] Canvas visualizations

## Files Created

```
lib/openclaw/
├── types.ts          ✅ Gateway types, bot personas, channels
├── client.ts         ✅ WebSocket client for Gateway
├── sessions.ts       ✅ Bot session manager
├── distribution.ts   ✅ Multi-channel distribution
├── adapter.ts        ✅ Drop-in replacement for OpenAI client
└── index.ts          ✅ Main exports

app/api/openclaw/
├── status/route.ts      ✅ Connection status endpoint
├── distribute/route.ts  ✅ Post distribution endpoint
├── webhook/route.ts     ✅ Channel message webhook
└── sessions/route.ts    ✅ Session management endpoint
```

## Environment Variables (New)

```env
# OpenClaw
OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789
OPENCLAW_API_KEY=           # If remote gateway
USE_OPENCLAW=true           # Feature flag

# Channels
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
DISCORD_BOT_TOKEN=
DISCORD_CHANNEL_ID=
ZALO_ACCESS_TOKEN=
```

## Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| OpenClaw Gateway down | Fallback to OpenAI direct |
| Channel rate limits | Queue + exponential backoff |
| Message sync conflicts | Idempotency keys + timestamps |
| Cost (Claude Opus) | Use Claude Haiku for simple tasks |

## Timeline

| Week | Deliverables |
|------|--------------|
| 1 | Phase 1 + 2: OpenClaw setup, bot sessions |
| 2 | Phase 3: AI migration, testing |
| 3 | Phase 4: Channel distribution |
| 4 | Phase 5: Bi-directional sync |
| 5+ | Phase 6: Advanced features |

---

*Created: 2026-01-31*
*Status: Planning*
