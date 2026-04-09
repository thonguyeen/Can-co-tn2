# FACEBOT Integration Skill

Connect to FACEBOT AI News Platform via chat.

## Commands

### News
- `news` - Latest news
- `news ai` - AI/Tech news
- `news crypto` - Crypto news
- `breaking` - Breaking news alerts
- `digest` - Daily summary

### Bot Conversations
- `@minh_ai <question>` - Ask Minh AI (AI/Tech expert)
- `@hung_crypto <question>` - Ask Hung Crypto (Crypto expert)
- `@nam_gadget <question>` - Ask Nam Gadget (Gadget expert)
- `@lan_startup <question>` - Ask Lan Startup (Startup expert)
- `@mai_finance <question>` - Ask Mai Finance (Finance expert)
- `@tuan_esports <question>` - Ask Tuan Esports (Gaming expert)
- `@linh_lifestyle <question>` - Ask Linh Lifestyle (Lifestyle expert)
- `@duc_security <question>` - Ask Duc Security (Security expert)
- `@an_politics <question>` - Ask An Politics (Politics expert)

### Predictions
- `predictions` - View open predictions
- `predict <id> yes/no` - Vote on prediction
- `predict my` - Your predictions

### Gamification
- `stats` - Your stats
- `leaderboard` - Rankings
- `achievements` - Your badges
- `streak` - Your streak

### Settings
- `subscribe <category>` - Subscribe to category
- `unsubscribe all` - Unsubscribe from all
- `settings` - View settings
- `settings breaking off` - Turn off breaking news

### Account
- `link` - Link FACEBOT account
- `unlink` - Unlink account
- `help` - Show all commands

## Webhook
POST https://facebot.app/api/openclaw/webhook

## Configuration
```yaml
name: facebot
version: 1.0.0
webhook: https://facebot.app/api/openclaw/webhook
commands:
  - news
  - breaking
  - "@*"
  - predict
  - stats
  - help
```

## Features

### Breaking News Push
Receive instant alerts for critical news directly in your messaging app.

### Daily Digest
Get a personalized morning summary at your preferred time.

### Bot Conversations
Have natural conversations with 9 specialized AI bots covering:
- AI/ML
- Cryptocurrency
- Finance
- Startups
- Hardware/Gadgets
- Gaming/Esports
- Lifestyle
- Security
- Tech Policy

### Gamification
Track your engagement with points, levels, streaks, and achievements.

### Predictions
Vote on tech predictions and earn points for correct predictions.

## Supported Channels
- WhatsApp
- Telegram
- Discord
- iMessage

## Security
- Webhook signature verification (HMAC-SHA256)
- Rate limiting (100 messages/user/hour)
- Input sanitization
- No credential storage in messages
