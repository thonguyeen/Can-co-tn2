'use client';

import { useState } from 'react';
import { getProvinces, getDistricts, getWards } from '../../../lib/data/vietnam-locations';

interface Bot {
  id: string;
  handle: string;
  name: string;
  category: string;
  color: string;
  is_envoy: boolean;
  assigned_province?: string;
  assigned_district?: string;
  assigned_ward?: string;
  daily_quota: number;
  posts_today: number;
}

export default function BotHRTab({ bots, onUpdate }: { bots: Bot[], onUpdate: () => void }) {
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [quota, setQuota] = useState(10);

  const handleOpenModal = (bot: Bot) => {
    setSelectedBot(bot);
    setProvince(bot.assigned_province || '');
    setDistrict(bot.assigned_district || '');
    setWard(bot.assigned_ward || '');
    setQuota(bot.daily_quota || 10);
    setModalMode('edit');
  };

  const handleOpenAddModal = () => {
    setSelectedBot(null);
    setProvince('');
    setDistrict('');
    setWard('');
    setQuota(10);
    setModalMode('add');
  };

  const handleSave = async () => {
    if (!selectedBot) return;
    setLoading(true);
    try {
      const res = await fetch('/api/bots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: selectedBot.handle,
          is_envoy: true,
          assigned_province: province,
          assigned_district: district,
          assigned_ward: ward,
          daily_quota: quota
        })
      });
      if (res.ok) {
        setModalMode(null);
        onUpdate();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const envoyBots = bots.filter(b => b.is_envoy !== false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">👨‍💼 Nhân Sự Bot</h2>
          <span className="text-sm text-slate-400">Tổng: {envoyBots.length} Bot Envoy</span>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-teal-500/20"
        >
          + Thêm Nhân Sự
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {envoyBots.map(bot => (
          <div 
            key={bot.id} 
            className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-teal-500/50 hover:shadow-[0_0_15px_rgba(20,184,166,0.1)] transition-all cursor-pointer"
            onClick={() => handleOpenModal(bot)}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                style={{ backgroundColor: bot.color || '#475569' }}
              >
                {bot.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-100 truncate">{bot.name}</h3>
                <p className="text-xs text-slate-400 truncate">@{bot.handle}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center text-sm text-slate-300">
                <span className="mr-2">📍</span>
                <span className="truncate">
                  {bot.assigned_district ? `${bot.assigned_district}, ${bot.assigned_province}` : 'Chưa phân công'}
                </span>
              </div>
              <div className="flex items-center text-sm text-slate-300">
                <span className="mr-2">🏠</span>
                <span className="capitalize">{bot.category?.replace('_', ' ') || 'Chưa phân loại'}</span>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Quota hôm nay</span>
                <span>{bot.posts_today} / {bot.daily_quota}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div 
                  className="bg-teal-500 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, (bot.posts_today / bot.daily_quota) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalMode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-700">
              <h3 className="font-semibold text-lg">{modalMode === 'add' ? 'Tuyển Nhân Sự Bot' : 'Hồ Sơ Nhân Viên'}</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-5 space-y-5">
              {modalMode === 'add' ? (
                <div className="mb-6">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Chọn Bot (Từ lực lượng dự bị)</label>
                  <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-teal-500 outline-none text-slate-200"
                    onChange={(e) => {
                      const bot = bots.find(b => b.handle === e.target.value);
                      if (bot) setSelectedBot(bot);
                    }}
                    value={selectedBot?.handle || ''}
                  >
                    <option value="">-- Lựa chọn Bot khả dụng --</option>
                    {bots.filter(b => !b.is_envoy).map(b => (
                      <option key={b.id} value={b.handle}>{b.name} (@{b.handle})</option>
                    ))}
                  </select>
                </div>
              ) : selectedBot ? (
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: selectedBot.color || '#475569' }}
                  >
                    {selectedBot.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-100">{selectedBot.name}</h4>
                    <p className="text-xs text-slate-400">@{selectedBot.handle}</p>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Khu Vực Phụ Trách</label>
                <div className="space-y-3">
                  <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    value={province}
                    onChange={(e) => { setProvince(e.target.value); setDistrict(''); setWard(''); }}
                  >
                    <option value="">-- Chọn Tỉnh / Thành phố --</option>
                    {getProvinces().map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                  </select>

                  <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    value={district}
                    onChange={(e) => { setDistrict(e.target.value); setWard(''); }}
                    disabled={!province}
                  >
                    <option value="">-- Chọn Quận / Huyện --</option>
                    {province && getDistricts(province).map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                  </select>

                  <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    disabled={!district}
                  >
                    <option value="">-- Chọn Phường / Xã --</option>
                    {province && district && getWards(province, district).map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-400">Chỉ Tiêu Hàng Ngày (Quota)</label>
                  <span className="text-xs text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded">{quota} bài/ngày</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={quota}
                  onChange={(e) => setQuota(parseInt(e.target.value))}
                  className="w-full accent-teal-500 mt-2"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-700 flex justify-end gap-3 bg-slate-800/50">
              <button 
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 disabled:opacity-50 flex items-center"
              >
                {loading ? 'Đang lưu...' : '💾 Lưu Hồ Sơ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
