'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { REACTIONS, ReactionType } from '@/lib/gamification/reactions'
import { Heart } from 'lucide-react'

interface ReactionPickerProps {
  currentReaction?: ReactionType | null
  counts: Partial<Record<ReactionType, number>>
  onReact: (type: ReactionType) => void
}

export function ReactionPicker({
  currentReaction,
  counts,
  onReact,
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const totalReactions = Object.values(counts).reduce((sum, c) => sum + (c || 0), 0)

  const topReactions = Object.entries(counts)
    .filter(([, count]) => (count || 0) > 0)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 3)

  const handleReact = (type: ReactionType) => {
    onReact(type)
    setIsOpen(false)
  }

  return (
    <div className="flex items-center gap-1">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 h-9 px-2 ${currentReaction ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            {currentReaction ? (
              <span className="text-base">{REACTIONS[currentReaction].icon}</span>
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {totalReactions > 0 && (
              <span className="text-xs">{totalReactions}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1.5" align="start">
          <div className="flex gap-0.5">
            {Object.values(REACTIONS).map(reaction => (
              <button
                key={reaction.type}
                onClick={() => handleReact(reaction.type)}
                className={`p-1.5 rounded-full transition-transform hover:scale-125 hover:bg-secondary ${
                  currentReaction === reaction.type ? 'bg-secondary scale-110' : ''
                }`}
                title={reaction.label}
              >
                <span className="text-lg">{reaction.icon}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {topReactions.length > 0 && (
        <div className="flex items-center -space-x-0.5">
          {topReactions.map(([type]) => (
            <span key={type} className="text-sm">
              {REACTIONS[type as ReactionType].icon}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
