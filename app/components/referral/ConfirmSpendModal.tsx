'use client'

import React from 'react'
import { Coins, AlertTriangle, Loader2 } from 'lucide-react'

interface ConfirmSpendModalProps {
  isOpen: boolean
  title: string
  description: string
  cost: number
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmSpendModal({ 
  isOpen, 
  title, 
  description, 
  cost, 
  isLoading, 
  onConfirm, 
  onCancel 
}: ConfirmSpendModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card w-full max-w-sm border border-border rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {description}
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-6 bg-secondary/50 p-3 rounded-lg border border-border">
            <span className="text-sm text-muted-foreground mr-2">Tổng chi phí:</span>
            <span className="font-mono font-bold text-xl text-foreground">{cost}</span>
            <Coins className="w-5 h-5 text-yellow-500" />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
