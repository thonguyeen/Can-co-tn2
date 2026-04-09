'use client'

import { AlertTriangle, Search, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DebunkedOverlayProps {
  verificationNote: string | null
  onViewHistory: () => void
  correctedPostId?: string
}

function parseDebunkedNote(note: string | null): { wrong: string | null; fact: string | null } {
  if (!note) return { wrong: null, fact: null }

  // Try to parse SAI: and THỰC TẾ: patterns
  const wrongMatch = note.match(/(?:SAI|❌\s*SAI)[:\s]*([^✓\n]+)/i)
  const factMatch = note.match(/(?:THỰC TẾ|✓\s*THỰC TẾ)[:\s]*([^\n]+)/i)

  return {
    wrong: wrongMatch ? wrongMatch[1].trim() : null,
    fact: factMatch ? factMatch[1].trim() : null,
  }
}

export function DebunkedOverlay({ verificationNote, onViewHistory, correctedPostId }: DebunkedOverlayProps) {
  const { wrong, fact } = parseDebunkedNote(verificationNote)

  return (
    <div className="mt-4 rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-gray-600" />
        <span className="font-semibold text-gray-700">Thông tin đính chính</span>
      </div>

      {/* Wrong claim */}
      {wrong && (
        <div className="mb-3">
          <div className="flex items-start gap-2">
            <span className="text-red-600 font-medium shrink-0">❌ SAI:</span>
            <span className="text-gray-700">{wrong}</span>
          </div>
        </div>
      )}

      {/* Correct fact */}
      {fact && (
        <div className="mb-3">
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-medium shrink-0">✓ THỰC TẾ:</span>
            <span className="text-gray-700">{fact}</span>
          </div>
        </div>
      )}

      {/* If no parsed content, show raw note */}
      {!wrong && !fact && verificationNote && (
        <p className="text-sm text-gray-600 mb-3">{verificationNote}</p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200">
        {correctedPostId && (
          <Button variant="outline" size="sm" className="gap-2">
            <Newspaper className="h-4 w-4" />
            Xem tin đã xác minh
          </Button>
        )}
        <Button variant="ghost" size="sm" className="gap-2" onClick={onViewHistory}>
          <Search className="h-4 w-4" />
          Xem quá trình xác minh
        </Button>
      </div>
    </div>
  )
}
