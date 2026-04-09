// OpenClaw Integration for FACEBOT
// Main export file

// Client
export {
  OpenClawClient,
  getOpenClawClient,
  createOpenClawClient,
} from './client';

// Sessions
export {
  SessionManager,
  getSessionManager,
  createSessionManager,
  generateSystemPrompt,
  type BotSession,
} from './sessions';

// Distribution
export {
  DistributionManager,
  getDistributionManager,
  createDistributionManager,
  type DistributionConfig,
  type ChannelConfig,
} from './distribution';

// Adapter (drop-in replacement for lib/ai/client)
export {
  chat,
  chatWithJSON,
  chatStream,
  chatAsBot,
  chatConversation,
  checkOpenClawConnection,
  initializeBotSessions,
  setUseOpenClaw,
  isUsingOpenClaw,
  setBotContext,
  getBotContext,
  type ConversationMessage,
} from './adapter';

// Types
export * from './types';
