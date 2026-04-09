'use client';

import { useState, useEffect } from 'react';
import { Bot, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { getPersona, type BotPersona } from '@/lib/agents/personas';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface BotLog {
  id: string;
  intent_id: string;
  bot_name: string;
  content: string;
  created_at: string;
}

interface ObserverSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function ObserverSidebar({ isCollapsed, onToggle }: ObserverSidebarProps) {
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchInitialLogs() {
      try {
        const res = await fetch('/api/comments?is_bot=true')
        if (res.ok) {
          const json = await res.json()
          if (json.data) {
            setLogs(json.data as BotLog[])
            setIsLive(true)
          }
        }
      } catch (error) {
        console.error('Failed to fetch observer logs', error)
      }
    }

    fetchInitialLogs();
  }, []);

  return (
    <div className={`border-l border-slate-800/50 bg-[#1e293b]/40 backdrop-blur-2xl hidden xl:flex flex-col z-20 sticky top-0 h-screen transition-all duration-300 relative ${isCollapsed ? 'w-24 pt-8 px-4 items-center bg-[#0f172a]' : 'w-[400px] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] bg-slate-900 overflow-hidden'}`}>
      
      {/* Toggle Button */}
      <button 
         onClick={onToggle}
         className="absolute -left-3 top-10 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-400 shadow-sm z-30 transition-transform hover:scale-110"
      >
         {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {isCollapsed ? (
        <div 
           className="w-14 h-14 rounded-xl bg-slate-800 shadow-sm flex items-center justify-center shrink-0 cursor-pointer hover:border-emerald-500 transition-colors relative border border-slate-700"
           onClick={onToggle}
           title="Mở AI Analytics"
        >
           <Bot className="w-7 h-7 text-emerald-500" />
           {isLive && (
             <span className="absolute flex h-3 w-3 top-0 right-0">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
             </span>
           )}
        </div>
      ) : (
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="p-4 bg-slate-800/80 backdrop-blur-md rounded-b-2xl border-b border-slate-700/50 flex items-center justify-between shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.2)] z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-x-0 h-[2px] bg-white top-0 animate-[scan_2s_ease-in-out_infinite]" />
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm tracking-wide">SuperBrain AI</h3>
                <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse border border-emerald-200" />
                  Live Stream
                </div>
              </div>
            </div>
            {/* Live Indicator */}
            {isLive && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1 shrink-0">
                <Activity className="w-3 h-3" /> Online
              </div>
            )}
          </div>

          {/* Logs Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm opacity-60">
                <Activity className="w-8 h-8 mb-2 animate-pulse" />
                Đang quét tần số AI...
              </div>
            ) : (
              logs.map((log) => {
                const persona = getPersona(log.bot_name);
                const color = persona?.color || '#10b981';
                const timeAgo = formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: vi });

                return (
                  <div 
                    key={log.id} 
                    className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 animate-in fade-in slide-in-from-top-4 duration-500 hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 shadow-sm"
                        style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
                      >
                        {persona?.avatar || '🤖'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {persona?.name || log.bot_name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                            {timeAgo}
                          </span>
                        </div>
                        <div className="text-[12px] text-slate-300 leading-relaxed font-medium">
                          {log.content}
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider font-semibold">
                          <span>Target:</span> 
                          <span className="truncate max-w-[120px]" style={{ color }}>#{log.intent_id.split('-')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-3 text-center border-t border-slate-800/50 bg-slate-900 text-[10px] text-slate-500 shrink-0">
            Hệ thống phân tích chủ động 24/7
          </div>
        </div>
      )}
    </div>
  );
}
