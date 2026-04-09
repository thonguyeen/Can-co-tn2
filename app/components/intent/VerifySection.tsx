'use client';

import { useState, useRef } from 'react';
import { ShieldCheck, Upload, MapPin, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifySectionProps {
  intentId: string;
  currentLevel: string;
}

type VerifyType = 'cccd' | 'sodo' | 'gps';

interface VerifyStatus {
  cccd: 'idle' | 'uploading' | 'done' | 'error';
  sodo: 'idle' | 'uploading' | 'done' | 'error';
  gps: 'idle' | 'checking' | 'done' | 'error';
}

export function VerifySection({ intentId, currentLevel }: VerifySectionProps) {
  const [status, setStatus] = useState<VerifyStatus>({ cccd: 'idle', sodo: 'idle', gps: 'idle' });
  const [results, setResults] = useState<Record<string, string>>({});
  const cccdRef = useRef<HTMLInputElement>(null);
  const sodoRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (type: VerifyType, file: File) => {
    setStatus((prev) => ({ ...prev, [type]: 'uploading' }));

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('intent_id', intentId);

      const res = await fetch(`/api/verify/${type}`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const ocrData = data.ocr;
        let summary = '';
        if (type === 'cccd' && ocrData) {
          summary = [ocrData.full_name, ocrData.id_number].filter(Boolean).join(' — ') || 'Đã xử lý';
        } else if (type === 'sodo' && ocrData) {
          summary = [ocrData.owner_name, ocrData.land_number].filter(Boolean).join(' — ') || 'Đã xử lý';
        }
        setResults((prev) => ({ ...prev, [type]: summary || 'Đã gửi xác minh' }));
        setStatus((prev) => ({ ...prev, [type]: 'done' }));
      } else {
        setStatus((prev) => ({ ...prev, [type]: 'error' }));
        setResults((prev) => ({ ...prev, [type]: 'Lỗi xử lý' }));
      }
    } catch {
      setStatus((prev) => ({ ...prev, [type]: 'error' }));
    }
  };

  const handleGps = async () => {
    setStatus((prev) => ({ ...prev, gps: 'checking' }));

    if (!navigator.geolocation) {
      setStatus((prev) => ({ ...prev, gps: 'error' }));
      setResults((prev) => ({ ...prev, gps: 'Trình duyệt không hỗ trợ GPS' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch('/api/verify/gps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              intent_id: intentId,
              user_lat: position.coords.latitude,
              user_lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const gps = data.gps;
            setResults((prev) => ({
              ...prev,
              gps: gps?.isNear
                ? `Xác minh thành công (${Math.round(gps.distance)}m)`
                : `Bạn cách vị trí ${Math.round(gps?.distance || 0)}m (cần ≤200m)`,
            }));
            setStatus((prev) => ({ ...prev, gps: gps?.isNear ? 'done' : 'error' }));
          } else {
            const err = await res.json();
            setResults((prev) => ({ ...prev, gps: err.error || 'Lỗi xác minh' }));
            setStatus((prev) => ({ ...prev, gps: 'error' }));
          }
        } catch {
          setStatus((prev) => ({ ...prev, gps: 'error' }));
        }
      },
      () => {
        setStatus((prev) => ({ ...prev, gps: 'error' }));
        setResults((prev) => ({ ...prev, gps: 'Không thể lấy vị trí' }));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const ITEMS: { type: VerifyType; label: string; desc: string; icon: React.ReactNode }[] = [
    { type: 'cccd', label: 'CCCD', desc: 'Xác minh danh tính', icon: <ShieldCheck className="w-4 h-4" /> },
    { type: 'sodo', label: 'Sổ đỏ', desc: 'Xác minh quyền sở hữu', icon: <Upload className="w-4 h-4" /> },
    { type: 'gps', label: 'GPS', desc: 'Xác minh vị trí', icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <div className="wm-panel">
      <div className="wm-panel-header">
        <span className="wm-panel-title flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Tăng độ tin cậy
        </span>
        <span className={cn(
          'wm-badge text-[8px]',
          currentLevel === 'verified' ? 'wm-badge-normal' : currentLevel === 'kyc' ? 'wm-badge-info' : 'wm-badge-elevated',
        )}>
          {currentLevel === 'verified' ? 'Đã xác thực' : currentLevel === 'kyc' ? 'Đã KYC' : 'Chưa xác thực'}
        </span>
      </div>

      <div className="divide-y divide-[var(--wm-border-subtle)]">
        {ITEMS.map((item) => {
          const s = status[item.type];
          const result = results[item.type];

          return (
            <div key={item.type} className="p-3 flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 flex items-center justify-center shrink-0',
                s === 'done' ? 'text-emerald-500' : s === 'error' ? 'text-red-500' : 'text-[var(--wm-text-muted)]',
              )}>
                {s === 'done' ? <CheckCircle2 className="w-5 h-5" /> :
                 s === 'error' ? <XCircle className="w-5 h-5" /> :
                 s === 'uploading' || s === 'checking' ? <Loader2 className="w-5 h-5 animate-spin" /> :
                 item.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--wm-text)]">{item.desc}</p>
                {result && (
                  <p className={cn('text-[10px] mt-0.5', s === 'done' ? 'text-emerald-600' : 'text-red-500')}>
                    {result}
                  </p>
                )}
              </div>

              {s === 'idle' && (
                item.type === 'gps' ? (
                  <button
                    onClick={handleGps}
                    className="text-xs text-[var(--wm-primary)] font-semibold hover:underline"
                  >
                    Xác minh
                  </button>
                ) : (
                  <>
                    <input
                      ref={item.type === 'cccd' ? cccdRef : sodoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(item.type, f);
                      }}
                    />
                    <button
                      onClick={() => (item.type === 'cccd' ? cccdRef : sodoRef).current?.click()}
                      className="text-xs text-[var(--wm-primary)] font-semibold hover:underline"
                    >
                      Tải lên
                    </button>
                  </>
                )
              )}

              {(s === 'uploading' || s === 'checking') && (
                <span className="text-[10px] text-[var(--wm-text-muted)]">Đang xử lý...</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
