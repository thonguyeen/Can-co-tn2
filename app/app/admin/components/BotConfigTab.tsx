'use client';

import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface Bot {
  id: string;
  handle: string;
  name: string;
  system_prompt?: string | null;
  knowledge_text?: string | null;
  schedule_config?: ScheduleConfig | null;
  bot_type?: string | null;
  is_active?: boolean | null;
  color?: string | null;
  color_accent?: string | null;
}

interface ScheduleConfig {
  activeHours?: { start: string; end: string };
  activeDays?: number[];
  intervalMinutes?: number;
  timezone?: string;
}

const BOT_TYPES = [
  { value: 'facebot', label: '💬 FaceBot (Bình luận)' },
  { value: 'crawler', label: '🕷️ Crawler (Cào dữ liệu)' },
  { value: 'curator', label: '📋 Curator (Parse dữ liệu)' },
  { value: 'analyst', label: '📊 Analyst (Phân tích)' },
  { value: 'alert', label: '🔔 Alert (Thông báo)' },
  { value: 'chatbot', label: '💬 Chatbot (Trợ lý AI)' },
];

const DAY_LABELS = [
  { value: 0, label: 'CN' },
  { value: 1, label: 'T2' },
  { value: 2, label: 'T3' },
  { value: 3, label: 'T4' },
  { value: 4, label: 'T5' },
  { value: 5, label: 'T6' },
  { value: 6, label: 'T7' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const INTERVAL_OPTIONS = [
  { value: 15, label: '15 phút' },
  { value: 30, label: '30 phút' },
  { value: 60, label: '1 giờ' },
  { value: 120, label: '2 giờ' },
  { value: 360, label: '6 giờ' },
  { value: 720, label: '12 giờ' },
  { value: 1440, label: '1 ngày' },
];

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export default function BotConfigTab({ bots }: { bots: Bot[] }) {
  const [selectedHandle, setSelectedHandle] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Form state
  const [systemPrompt, setSystemPrompt] = useState('');
  const [knowledgeText, setKnowledgeText] = useState('');
  const [botType, setBotType] = useState('facebot');
  const [scheduleStart, setScheduleStart] = useState('08:00');
  const [scheduleEnd, setScheduleEnd] = useState('22:00');
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [intervalMinutes, setIntervalMinutes] = useState(60);

  // ── Load bot data when selection changes ──
  const loadBotData = useCallback((handle: string) => {
    const bot = bots.find(b => b.handle === handle);
    if (!bot) return;

    setSystemPrompt(bot.system_prompt || '');
    setKnowledgeText(bot.knowledge_text || '');
    setBotType(bot.bot_type || 'facebot');

    const schedule = bot.schedule_config as ScheduleConfig | null;
    if (schedule) {
      setScheduleStart(schedule.activeHours?.start || '08:00');
      setScheduleEnd(schedule.activeHours?.end || '22:00');
      setActiveDays(schedule.activeDays || [1, 2, 3, 4, 5]);
      setIntervalMinutes(schedule.intervalMinutes || 60);
    } else {
      setScheduleStart('08:00');
      setScheduleEnd('22:00');
      setActiveDays([1, 2, 3, 4, 5]);
      setIntervalMinutes(60);
    }
  }, [bots]);

  useEffect(() => {
    if (selectedHandle) {
      loadBotData(selectedHandle);
    }
  }, [selectedHandle, loadBotData]);

  // ── Toggle day ──
  const toggleDay = (day: number) => {
    setActiveDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  // ── Save ──
  const handleSave = async () => {
    if (!selectedHandle) return;
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch('/api/bots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: selectedHandle,
          system_prompt: systemPrompt,
          knowledge_text: knowledgeText,
          bot_type: botType,
          schedule_config: {
            activeHours: { start: scheduleStart, end: scheduleEnd },
            activeDays,
            intervalMinutes,
            timezone: 'Asia/Ho_Chi_Minh',
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ type: 'success', msg: '✅ Đã lưu thành công!' });
      } else {
        setToast({ type: 'error', msg: `❌ Lỗi: ${data.error}` });
      }
    } catch (err) {
      setToast({ type: 'error', msg: '❌ Lỗi kết nối server' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // ── Derive current bot info ──
  const currentBot = bots.find(b => b.handle === selectedHandle);

  // ── Check schedule status ──
  const getScheduleStatus = (): { label: string; color: string } => {
    if (!currentBot?.is_active) return { label: '⚪ Tắt', color: 'text-slate-500' };
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const startH = parseInt(scheduleStart);
    const endH = parseInt(scheduleEnd);
    const inHours = hour >= startH && hour < endH;
    const inDays = activeDays.includes(day);
    if (inHours && inDays) return { label: '🟢 Đang hoạt động', color: 'text-green-400' };
    return { label: '🔴 Đang ngủ', color: 'text-red-400' };
  };

  const status = getScheduleStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">🧠 Bot Config</h2>
        <p className="text-sm text-slate-400 mt-1">Cấu hình System Prompt, Knowledge và Schedule cho từng bot</p>
      </div>

      {/* Bot Selector */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <label className="block text-xs font-medium text-slate-400 mb-2">Chọn Bot</label>
        <select
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-slate-200"
          value={selectedHandle}
          onChange={(e) => setSelectedHandle(e.target.value)}
        >
          <option value="">-- Chọn Bot để cấu hình --</option>
          {bots.map(b => (
            <option key={b.id} value={b.handle}>
              {b.name} (@{b.handle}) {b.bot_type ? `[${b.bot_type}]` : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedHandle && currentBot && (
        <>
          {/* Bot Info Bar */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                  style={{ backgroundColor: currentBot.color_accent || currentBot.color || '#475569' }}
                >
                  {currentBot.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">{currentBot.name}</h3>
                  <p className="text-xs text-slate-400">@{currentBot.handle}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Bot Type Selector */}
                <select
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none text-slate-200"
                  value={botType}
                  onChange={(e) => setBotType(e.target.value)}
                >
                  {BOT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                {/* Status Badge */}
                <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <label className="block text-xs font-medium text-slate-400 mb-2">System Prompt</label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-slate-200 resize-y font-mono leading-relaxed"
              rows={8}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Nhập system prompt cho bot... (VD: Bạn là bot phân tích thị trường BĐS...)"
              maxLength={10000}
            />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Hướng dẫn bot cách hành xử, trả lời, và xử lý dữ liệu</span>
              <span>{systemPrompt.length.toLocaleString()} / 10,000</span>
            </div>
          </div>

          {/* Knowledge Text */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Knowledge Text
              <span className="text-slate-600 ml-2">(kiến thức tham khảo, bảng giá, quy hoạch...)</span>
            </label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-slate-200 resize-y font-mono leading-relaxed"
              rows={10}
              value={knowledgeText}
              onChange={(e) => setKnowledgeText(e.target.value)}
              placeholder={"## Bảng giá tham khảo TP.HCM\n- Quận 7: Căn hộ 45-60 tr/m2\n- Thủ Đức: Căn hộ 50-80 tr/m2\n\n## Quy hoạch 2026\n- Metro Line 1: Q1 → Suối Tiên"}
              maxLength={50000}
            />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Dữ liệu tham khảo sẽ được inject vào prompt khi bot hoạt động</span>
              <span>{knowledgeText.length.toLocaleString()} / 50,000</span>
            </div>
          </div>

          {/* Schedule Config */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <label className="block text-xs font-medium text-slate-400 mb-4">
              Schedule (Lịch hoạt động)
            </label>

            {/* Active Hours */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm text-slate-300 w-28">Giờ hoạt động:</span>
              <select
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none text-slate-200"
                value={scheduleStart}
                onChange={(e) => setScheduleStart(e.target.value)}
              >
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-slate-500">đến</span>
              <select
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none text-slate-200"
                value={scheduleEnd}
                onChange={(e) => setScheduleEnd(e.target.value)}
              >
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              {parseInt(scheduleEnd) <= parseInt(scheduleStart) && (
                <span className="text-xs text-amber-400">⚠ Qua ngày</span>
              )}
            </div>

            {/* Active Days */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm text-slate-300 w-28">Ngày hoạt động:</span>
              <div className="flex gap-2">
                {DAY_LABELS.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      activeDays.includes(day.value)
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                        : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interval */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300 w-28">Tần suất:</span>
              <select
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none text-slate-200"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(parseInt(e.target.value))}
              >
                {INTERVAL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="text-xs text-slate-500">/ lần chạy</span>
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <div className={`p-4 rounded-xl text-sm font-medium ${
              toast.type === 'success' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              {toast.msg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => loadBotData(selectedHandle)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              ↩ Hủy thay đổi
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                '💾 Lưu cấu hình'
              )}
            </button>
          </div>
        </>
      )}

      {!selectedHandle && (
        <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-slate-400 text-sm">Chọn một bot từ dropdown phía trên để bắt đầu cấu hình</p>
        </div>
      )}
    </div>
  );
}
