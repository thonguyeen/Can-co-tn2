'use client';

import { cn, formatDistanceToNow } from '@/lib/utils';
import { getPersona, getPersonaColor } from '@/lib/agents/personas';

interface BotCommentProps {
  botName: string;
  content: string;
  createdAt?: string;
  compact?: boolean;
}

export function BotComment({ botName, content, createdAt, compact = false }: BotCommentProps) {
  const botId = botName.toLowerCase().replace(/\s+/g, '_');
  const persona = getPersona(botId);
  const color = persona?.color || getPersonaColor(botId);
  const avatar = persona?.avatar || '🤖';
  const title = persona?.title || botName;
  const displayName = persona?.name || botName;

  return (
    <div
      className="p-2.5 border-l-2"
      style={{
        borderLeftColor: color,
        background: `color-mix(in srgb, ${color} 5%, transparent)`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{avatar}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
          {displayName}
        </span>
        <span className="text-[10px] text-[var(--wm-text-faint)]">·</span>
        <span className="text-[10px] text-[var(--wm-text-faint)]">{title}</span>
      </div>
      <p className={cn(
        'text-xs text-[var(--wm-text-secondary)] leading-relaxed whitespace-pre-line',
        compact && 'line-clamp-2',
      )}>
        {content}
      </p>
      {createdAt && !compact && (
        <p className="text-[9px] text-[var(--wm-text-faint)] mt-1">{formatDistanceToNow(createdAt)}</p>
      )}
    </div>
  );
}
