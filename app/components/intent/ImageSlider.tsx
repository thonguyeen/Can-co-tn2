'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSliderProps {
    images: { id: string; url: string; display_order: number }[];
    className?: string;
}

export function ImageSlider({ images, className = '' }: ImageSliderProps) {
    const [current, setCurrent] = useState(0);
    const total = images.length;

    const prev = useCallback(() => setCurrent(i => (i - 1 + total) % total), [total]);
    const next = useCallback(() => setCurrent(i => (i + 1) % total), [total]);

    // ── No images → gradient placeholder ──
    if (total === 0) {
        return (
            <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] ${className}`}>
                <span className="text-white/20 font-black text-5xl select-none">Cần&amp;Có</span>
            </div>
        );
    }

    return (
        <div className={`relative flex flex-col bg-[#0f0f1a] ${className}`}>
            {/* ── Main Image ── */}
            <div className="relative flex-1 overflow-hidden">
                <img
                    src={images[current].url}
                    alt={`Ảnh ${current + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                />

                {/* Gradient overlay bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Prev arrow */}
                {total > 1 && (
                    <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-black/80 transition cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.5)] border border-white/20"
                        aria-label="Ảnh trước"
                    >
                        <ChevronLeft className="w-5 h-5 text-white drop-shadow" />
                    </button>
                )}

                {/* Next arrow */}
                {total > 1 && (
                    <button
                        onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-black/80 transition cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.5)] border border-white/20"
                        aria-label="Ảnh tiếp"
                    >
                        <ChevronRight className="w-5 h-5 text-white drop-shadow" />
                    </button>
                )}

                {/* Counter + dots */}
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 z-10">
                    {/* Dots */}
                    <div className="flex gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${i === current ? 'w-4 bg-violet-400' : 'w-1.5 bg-white/40'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Counter pill */}
                <div className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/80 text-xs font-medium">
                    {current + 1} / {total}
                </div>
            </div>

            {/* ── Thumbnail strip ── */}
            {total > 1 && (
                <div className="flex gap-1.5 p-2 bg-[#0a0a12] shrink-0">
                    {images.slice(0, 5).map((img, i) => (
                        <button
                            key={img.id}
                            onClick={() => setCurrent(i)}
                            className={`relative flex-1 h-14 rounded overflow-hidden cursor-pointer transition-all ${i === current
                                ? 'ring-2 ring-violet-500 opacity-100'
                                : 'opacity-50 hover:opacity-75'
                                }`}
                        >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
