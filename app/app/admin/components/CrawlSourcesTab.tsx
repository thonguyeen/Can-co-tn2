'use client';

import { useState, useEffect } from 'react';

interface CrawlSource {
  id: string;
  name: string;
  url: string;
  source_type: 'rss' | 'html' | 'api';
  category: string;
  province?: string;
  district?: string;
  is_active: boolean;
  last_crawled_at?: string;
  total_items_crawled: number;
}

export default function CrawlSourcesTab() {
  const [sources, setSources] = useState<CrawlSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState<'rss' | 'html'>('rss');
  const [actionLoading, setActionLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crawl-sources');
      const data = await res.json();
      if (data.success) {
        setSources(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (source?: CrawlSource) => {
    if (source) {
      setEditingId(source.id);
      setName(source.name);
      setUrl(source.url);
      setSourceType(source.source_type as 'rss' | 'html');
    } else {
      setEditingId(null);
      setName('');
      setUrl('');
      setSourceType('rss');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { id: editingId, name, url, source_type: sourceType }
        : { name, url, source_type: sourceType, category: 'real_estate' };

      const res = await fetch('/api/crawl-sources', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchSources();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch('/api/crawl-sources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !current })
      });
      fetchSources();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa nguồn cào này?')) return;
    try {
      await fetch(`/api/crawl-sources?id=${id}`, { method: 'DELETE' });
      fetchSources();
    } catch (e) { console.error(e); }
  };

  const handleTriggerAll = async () => {
    setTriggering(true);
    try {
      const res = await fetch('/api/crawler/trigger', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Cào thành công! Đã xử lý ${data.results.sourcesProcessed} nguồn, lưu ${data.results.itemsSaved} tin mới.`);
        fetchSources();
      } else {
        alert('Có lỗi khi cào dữ liệu.');
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi khi cào dữ liệu.');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">🌐 Nguồn Cào Dữ Liệu</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-sm font-medium shadow-lg shadow-sky-600/20 transition-all"
          >
            + Thêm Nguồn
          </button>
          <button 
            onClick={handleTriggerAll}
            disabled={triggering}
            className="px-4 py-2 bg-slate-800 border border-slate-700 hover:border-teal-500 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            {triggering ? '⏳ Đang quét...' : '🔄 Cào Tất Cả Ngay'}
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Đang tải dữ liệu...</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Tên Nguồn & URL</th>
                <th className="px-6 py-4 font-medium">Loại</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Thống kê</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {sources.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Chưa có nguồn cào nào.</td></tr>
              ) : (
                sources.map(source => (
                  <tr key={source.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-100">{source.name}</div>
                      <div className="text-xs text-slate-400 max-w-[200px] md:max-w-[300px] truncate">{source.url}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs uppercase font-medium">
                        {source.source_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleActive(source.id, source.is_active)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          source.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {source.is_active ? 'TIN CẬY' : 'TẠM DỪNG'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="text-slate-300">Đã cào: <span className="font-medium text-teal-400">{source.total_items_crawled}</span></div>
                      <div className="text-slate-500 mt-0.5">Lần cuối: {source.last_crawled_at ? new Date(source.last_crawled_at).toLocaleDateString('vi-VN') : 'Chưa cào'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(source)} className="text-sky-400 hover:text-sky-300 mr-4 text-xs font-medium">Sửa</button>
                      <button onClick={() => handleDelete(source.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-700">
              <h3 className="font-semibold text-lg">{editingId ? 'Sửa Nguồn Cào' : 'Thêm Nguồn Cào Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tên Gọi Gợi Nhớ (Ví dụ: VNExpress BĐS)</label>
                <input 
                  type="text" 
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:border-teal-500 text-white"
                  placeholder="Nhập tên nguồn..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Đường Mạng (URL)</label>
                <input 
                  type="url" 
                  value={url} onChange={e => setUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:border-teal-500 text-white"
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Loại Nguồn</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer touch-none">
                    <input 
                      type="radio" name="sourceType" value="rss"
                      checked={sourceType === 'rss'} onChange={() => setSourceType('rss')}
                      className="accent-teal-500"
                    />
                    <span className="text-sm">RSS Feed (Nhanh & Ổn định)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer touch-none">
                    <input 
                      type="radio" name="sourceType" value="html"
                      checked={sourceType === 'html'} onChange={() => setSourceType('html')}
                      className="accent-teal-500"
                    />
                    <span className="text-sm">HTML Scraping (Chậm)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-700 flex justify-end gap-3 bg-slate-800/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                disabled={actionLoading || !name || !url}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/20 disabled:opacity-50"
              >
                {actionLoading ? 'Đang lưu...' : '💾 Lưu Nguồn Cào'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
